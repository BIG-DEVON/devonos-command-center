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

    const draft = await prisma.aiDraft.update({
      where: {
        id,
      },
      data: {
        title: body.title === undefined ? undefined : String(body.title).trim(),
        category:
          body.category === undefined ? undefined : String(body.category),
        tone: body.tone === undefined ? undefined : String(body.tone),
        status: body.status === undefined ? undefined : String(body.status),
        instruction:
          body.instruction === undefined
            ? undefined
            : String(body.instruction).trim(),
        sourceText:
          body.sourceText === undefined
            ? undefined
            : String(body.sourceText).trim(),
        output:
          body.output === undefined ? undefined : String(body.output).trim(),
        notes: body.notes === undefined ? undefined : String(body.notes).trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      draft,
    });
  } catch (error) {
    console.error("Failed to update AI draft:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update AI draft.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.aiDraft.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to delete AI draft:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to delete AI draft.",
      },
      { status: 500 }
    );
  }
}