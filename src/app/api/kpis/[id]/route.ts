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

    const kpi = await prisma.kpiItem.update({
      where: {
        id,
      },
      data: {
        title: body.title === undefined ? undefined : String(body.title).trim(),
        owner: body.owner === undefined ? undefined : String(body.owner).trim(),
        status: body.status === undefined ? undefined : String(body.status),
        priority:
          body.priority === undefined ? undefined : String(body.priority),
        dueDate: body.dueDate === undefined ? undefined : String(body.dueDate),
        description:
          body.description === undefined
            ? undefined
            : String(body.description).trim(),
        outcome:
          body.outcome === undefined ? undefined : String(body.outcome).trim(),
        notes: body.notes === undefined ? undefined : String(body.notes).trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      kpi,
    });
  } catch (error) {
    console.error("Failed to update KPI:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update KPI.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.kpiItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to delete KPI:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to delete KPI.",
      },
      { status: 500 }
    );
  }
}