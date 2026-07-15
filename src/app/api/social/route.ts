import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const drafts = await prisma.socialDraft.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      drafts,
    });
  } catch (error) {
    console.error("Failed to load social drafts:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load social drafts.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const draft = await prisma.socialDraft.create({
      data: {
        title: String(body.title ?? "").trim(),
        campaign: String(body.campaign ?? "").trim(),
        platform: String(body.platform ?? "Instagram"),
        status: String(body.status ?? "Draft"),
        scheduledDate: String(body.scheduledDate ?? ""),
        caption: String(body.caption ?? "").trim(),
        visualDirection: String(body.visualDirection ?? "").trim(),
        hashtags: String(body.hashtags ?? "").trim(),
        notes: String(body.notes ?? "").trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      draft,
    });
  } catch (error) {
    console.error("Failed to create social draft:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create social draft.",
      },
      { status: 500 }
    );
  }
}