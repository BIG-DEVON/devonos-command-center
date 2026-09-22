import { NextResponse } from "next/server";
import {
  getAutomationControlCenter,
  nextAutomationRun,
  updateDailyIntelligenceSchedule,
} from "@/lib/automations";

export async function GET() {
  try {
    const data = await getAutomationControlCenter();

    return NextResponse.json({
      ok: true,
      ...data,
    });
  } catch (error) {
    console.error("Failed to load automations:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Automation controls could not be loaded.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      enabled?: boolean;
      time?: string;
    };
    const schedule = await updateDailyIntelligenceSchedule(body);

    return NextResponse.json({
      ok: true,
      schedule,
      nextRunAt: schedule.enabled
        ? nextAutomationRun(schedule.time, schedule.timezone).toISOString()
        : null,
    });
  } catch (error) {
    console.error("Failed to update automation schedule:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "The automation schedule could not be saved.",
      },
      { status: 500 }
    );
  }
}
