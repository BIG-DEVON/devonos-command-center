import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.globalEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      events,
    });
  } catch (error) {
    console.error("Failed to load events:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load events.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const event = await prisma.globalEvent.create({
      data: {
        title: String(body.title ?? "").trim(),
        date: String(body.date ?? ""),
        category: String(body.category ?? "Global Observance"),
        relevance: String(body.relevance ?? "Medium"),
        status: String(body.status ?? "Idea"),
        contentAngle: String(body.contentAngle ?? "").trim(),
        visualDirection: String(body.visualDirection ?? "").trim(),
        captionDraft: String(body.captionDraft ?? "").trim(),
        notes: String(body.notes ?? "").trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      event,
    });
  } catch (error) {
    console.error("Failed to create event:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create event.",
      },
      { status: 500 }
    );
  }
}