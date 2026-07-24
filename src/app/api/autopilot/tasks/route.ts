import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.autopilotTask.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      tasks,
    });
  } catch (error) {
    console.error("Failed to load Autopilot tasks:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Failed to load Autopilot tasks. Confirm the AutopilotTask Prisma model exists, then run npx prisma migrate dev and npx prisma generate.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const task = await prisma.autopilotTask.create({
      data: {
        title: String(body.title ?? "").trim(),
        module: String(body.module ?? "").trim(),
        severity: String(body.severity ?? "medium"),
        status: String(body.status ?? "Open"),
        dueDate: String(body.dueDate ?? ""),
        detail: String(body.detail ?? "").trim(),
        action: String(body.action ?? "").trim(),
        href: String(body.href ?? "").trim(),
        sourceSignalId: String(body.sourceSignalId ?? "").trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      task,
    });
  } catch (error) {
    console.error("Failed to create Autopilot task:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Failed to create Autopilot task. Confirm the AutopilotTask Prisma model exists and the migration has been applied.",
      },
      { status: 500 }
    );
  }
}