import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseGlobalEventInput,
  type GlobalEventWrite,
} from "@/lib/global-event-input";

export async function GET() {
  try {
    const events = await prisma.globalEvent.findMany({
      orderBy: {
        date: "asc",
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
    const body = await request.json().catch(() => null);
    const parsed = parseGlobalEventInput(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, message: parsed.message },
        { status: 400 }
      );
    }
    const eventInput = parsed.data as GlobalEventWrite;
    const existing = await prisma.globalEvent.findFirst({
      where: {
        title: eventInput.title,
        date: eventInput.date,
      },
    });
    if (existing) {
      return NextResponse.json({
        ok: true,
        event: existing,
        existing: true,
        message: "That moment is already in the Morrow plan.",
      });
    }

    const event = await prisma.globalEvent.create({
      data: eventInput,
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
