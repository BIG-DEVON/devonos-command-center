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

    const project = await prisma.projectRecord.update({
      where: {
        id,
      },
      data: {
        name: body.name === undefined ? undefined : String(body.name).trim(),
        owner: body.owner === undefined ? undefined : String(body.owner).trim(),
        category:
          body.category === undefined ? undefined : String(body.category).trim(),
        status: body.status === undefined ? undefined : String(body.status),
        priority:
          body.priority === undefined ? undefined : String(body.priority),
        startDate:
          body.startDate === undefined ? undefined : String(body.startDate),
        dueDate: body.dueDate === undefined ? undefined : String(body.dueDate),
        objective:
          body.objective === undefined
            ? undefined
            : String(body.objective).trim(),
        deliverables:
          body.deliverables === undefined
            ? undefined
            : String(body.deliverables).trim(),
        notes: body.notes === undefined ? undefined : String(body.notes).trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      project,
    });
  } catch (error) {
    console.error("Failed to update project:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update project.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.projectRecord.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to delete project:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to delete project.",
      },
      { status: 500 }
    );
  }
}
