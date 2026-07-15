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

    const newsItem = await prisma.newsItem.update({
      where: {
        id,
      },
      data: {
        headline:
          body.headline === undefined ? undefined : String(body.headline).trim(),
        source: body.source === undefined ? undefined : String(body.source).trim(),
        url: body.url === undefined ? undefined : String(body.url).trim(),
        summary:
          body.summary === undefined ? undefined : String(body.summary).trim(),
        relevance:
          body.relevance === undefined ? undefined : String(body.relevance),
        notes: body.notes === undefined ? undefined : String(body.notes).trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      newsItem,
    });
  } catch (error) {
    console.error("Failed to update news item:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update news item.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.newsItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to delete news item:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to delete news item.",
      },
      { status: 500 }
    );
  }
}