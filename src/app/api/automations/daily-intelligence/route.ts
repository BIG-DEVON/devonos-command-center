import { NextRequest, NextResponse } from "next/server";
import {
  ensureDefaultAutomationSchedule,
  runDailyIntelligenceAutomation,
} from "@/lib/automations";
import { scheduledRequestIsAuthorized } from "@/lib/automation-request";
import {
  MORROW_SESSION_COOKIE,
  readMorrowSession,
} from "@/lib/morrow-session";

async function runAutomation(request: NextRequest, allowSession: boolean) {
  try {
    const scheduled = scheduledRequestIsAuthorized(request);
    if (!scheduled) {
      if (!allowSession) {
        return NextResponse.json(
          { ok: false, message: "Automation worker authorization failed." },
          { status: 401 }
        );
      }
      const token = request.cookies.get(MORROW_SESSION_COOKIE)?.value;
      const session = await readMorrowSession(token, { touch: false });
      if (!session) {
        return NextResponse.json(
          { ok: false, message: "Sign in before running the command sweep." },
          { status: 401 }
        );
      }
    }
    const trigger = scheduled ? "Scheduled" : "Manual";
    if (scheduled) {
      const schedule = await ensureDefaultAutomationSchedule();
      if (!schedule.enabled) {
        return NextResponse.json({ ok: true, skipped: true, reason: "Automation disabled." });
      }
    }
    const result = await runDailyIntelligenceAutomation(trigger);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Daily intelligence automation failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "The daily command sweep did not complete. The failed run is recorded in Autopilot.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return runAutomation(request, false);
}

export async function POST(request: NextRequest) {
  return runAutomation(request, true);
}
