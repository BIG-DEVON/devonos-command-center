import { NextResponse } from "next/server";
import { validateNewsInput } from "@/lib/news-input";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const topic = searchParams.get("topic");
    const query = searchParams.get("query")?.trim();

    const newsItems = await prisma.newsItem.findMany({
      where: {
        status: status && status !== "All" ? status : undefined,
        topic: topic && topic !== "All" ? topic : undefined,
        OR: query
          ? [
              { headline: { contains: query } },
              { source: { contains: query } },
              { summary: { contains: query } },
              { topic: { contains: query } },
              { channel: { contains: query } },
            ]
          : undefined,
      },
      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          score: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 500,
    });

    return NextResponse.json({
      ok: true,
      newsItems,
    });
  } catch (error) {
    console.error("Failed to load news items:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load news items.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    let input;
    try {
      input = validateNewsInput(body);
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          message: error instanceof Error ? error.message : "News input is invalid.",
        },
        { status: 400 }
      );
    }

    const newsItem = await prisma.newsItem.create({
      data: input as Required<typeof input>,
    });

    return NextResponse.json({
      ok: true,
      newsItem,
    });
  } catch (error) {
    console.error("Failed to create news item:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create news item.",
      },
      { status: 500 }
    );
  }
}
