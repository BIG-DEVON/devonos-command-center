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

    const draft = await prisma.socialDraft.update({
      where: {
        id,
      },
      data: {
        title: body.title === undefined ? undefined : String(body.title).trim(),
        campaign:
          body.campaign === undefined ? undefined : String(body.campaign).trim(),
        platform:
          body.platform === undefined ? undefined : String(body.platform),
        status: body.status === undefined ? undefined : String(body.status),
        scheduledDate:
          body.scheduledDate === undefined
            ? undefined
            : String(body.scheduledDate),
        caption:
          body.caption === undefined ? undefined : String(body.caption).trim(),
        visualDirection:
          body.visualDirection === undefined
            ? undefined
            : String(body.visualDirection).trim(),
        hashtags:
          body.hashtags === undefined ? undefined : String(body.hashtags).trim(),
        notes: body.notes === undefined ? undefined : String(body.notes).trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      draft,
    });
  } catch (error) {
    console.error("Failed to update social draft:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update social draft.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.socialDraft.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to delete social draft:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to delete social draft.",
      },
      { status: 500 }
    );
  }
}