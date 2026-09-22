import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseGlobalEventInput } from "@/lib/global-event-input";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = parseGlobalEventInput(body, { partial: true });
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, message: parsed.message },
        { status: 400 }
      );
    }

    const event = await prisma.globalEvent.update({
      where: {
        id,
      },
      data: parsed.data,
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
