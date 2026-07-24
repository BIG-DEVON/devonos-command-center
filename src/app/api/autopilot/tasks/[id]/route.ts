import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const task = await prisma.autopilotTask.update({
      where: {
        id,
      },
      data: {
        title: body.title === undefined ? undefined : String(body.title).trim(),
        module:
          body.module === undefined ? undefined : String(body.module).trim(),
        severity:
          body.severity === undefined ? undefined : String(body.severity),
        status: body.status === undefined ? undefined : String(body.status),
        dueDate:
          body.dueDate === undefined ? undefined : String(body.dueDate),
        detail:
          body.detail === undefined ? undefined : String(body.detail).trim(),
        action:
          body.action === undefined ? undefined : String(body.action).trim(),
        href: body.href === undefined ? undefined : String(body.href).trim(),
        sourceSignalId:
          body.sourceSignalId === undefined
            ? undefined
            : String(body.sourceSignalId).trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      task,
    });
  } catch (error) {
    console.error("Failed to update Autopilot task:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update Autopilot task.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.autopilotTask.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to delete Autopilot task:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to delete Autopilot task.",
      },
      { status: 500 }
    );
  }
}