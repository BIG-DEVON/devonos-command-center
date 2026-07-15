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

    const event = await prisma.globalEvent.update({
      where: {
        id,
      },
      data: {
        title: body.title === undefined ? undefined : String(body.title).trim(),
        date: body.date === undefined ? undefined : String(body.date),
        category:
          body.category === undefined ? undefined : String(body.category),
        relevance:
          body.relevance === undefined ? undefined : String(body.relevance),
        status: body.status === undefined ? undefined : String(body.status),
        contentAngle:
          body.contentAngle === undefined
            ? undefined
            : String(body.contentAngle).trim(),
        visualDirection:
          body.visualDirection === undefined
            ? undefined
            : String(body.visualDirection).trim(),
        captionDraft:
          body.captionDraft === undefined
            ? undefined
            : String(body.captionDraft).trim(),
        notes: body.notes === undefined ? undefined : String(body.notes).trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      event,
    });
  } catch (error) {
    console.error("Failed to update event:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update event.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.globalEvent.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to delete event:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to delete event.",
      },
      { status: 500 }
    );
  }
}