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

    const asset = await prisma.assetRecord.update({
      where: { id },
      data: {
        name: body.name === undefined ? undefined : String(body.name).trim(),
        type: body.type === undefined ? undefined : String(body.type),
        project:
          body.project === undefined ? undefined : String(body.project).trim(),
        status: body.status === undefined ? undefined : String(body.status),
        priority:
          body.priority === undefined ? undefined : String(body.priority),
        link: body.link === undefined ? undefined : String(body.link).trim(),
        tags: body.tags === undefined ? undefined : String(body.tags).trim(),
        notes: body.notes === undefined ? undefined : String(body.notes).trim(),
      },
    });

    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    console.error("Failed to update asset:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update asset." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.assetRecord.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete asset:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete asset." },
      { status: 500 }
    );
  }
}
