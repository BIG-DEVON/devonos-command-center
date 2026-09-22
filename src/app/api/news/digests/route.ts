import { NextResponse } from "next/server";
import { createNewsDigest } from "@/lib/news-intelligence";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const digests = await prisma.newsDigest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
    });

    return NextResponse.json({
      ok: true,
      digests,
    });
  } catch (error) {
    console.error("Failed to load news digests:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "News digests could not be loaded.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      itemIds?: string[];
    };
    const requestedIds = Array.isArray(body.itemIds)
      ? body.itemIds.filter((id) => typeof id === "string")
      : [];
    const { digest } = await createNewsDigest({
      itemIds: requestedIds,
      mode: "manual",
    });

    return NextResponse.json({
      ok: true,
      digest,
    });
  } catch (error) {
    console.error("Failed to create news digest:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "The news digest could not be created.",
      },
      { status: 500 }
    );
  }
}
