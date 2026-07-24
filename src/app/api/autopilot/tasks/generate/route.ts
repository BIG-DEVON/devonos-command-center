import { NextResponse } from "next/server";
import {
  ensureAutopilotTasks,
  getAutopilotBrief,
} from "@/lib/autopilot-tasks";

export async function POST(request: Request) {
  try {
    const brief = await getAutopilotBrief(request);
    const result = await ensureAutopilotTasks(brief);

    return NextResponse.json({
      ok: true,
      created: result.created,
      skipped: result.skipped,
      message:
        result.created > 0
          ? `DevonOS created ${result.created} new task(s) and skipped ${result.skipped} existing task(s).`
          : `No new tasks were needed. DevonOS skipped ${result.skipped} existing task(s).`,
    });
  } catch (error) {
    console.error("Failed to generate Autopilot tasks:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "DevonOS could not generate tasks from the current signals.",
      },
      { status: 500 }
    );
  }
}
