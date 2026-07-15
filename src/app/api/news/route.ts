import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const newsItems = await prisma.newsItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
    const body = await request.json();

    const newsItem = await prisma.newsItem.create({
      data: {
        headline: String(body.headline ?? "").trim(),
        source: String(body.source ?? "").trim(),
        url: String(body.url ?? "").trim(),
        summary: String(body.summary ?? "").trim(),
        relevance: String(body.relevance ?? "Medium"),
        notes: String(body.notes ?? "").trim(),
      },
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