import { NextResponse } from "next/server";
import { validateNewsInput } from "@/lib/news-input";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    let input;
    try {
      input = validateNewsInput(body, { partial: true });
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          message: error instanceof Error ? error.message : "News input is invalid.",
        },
        { status: 400 }
      );
    }

    const newsItem = await prisma.newsItem.update({
      where: {
        id,
      },
      data: input,
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
