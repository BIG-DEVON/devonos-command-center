import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profiles = await prisma.birthdayProfile.findMany({
      orderBy: [{ month: "asc" }, { day: "asc" }],
    });

    return NextResponse.json({ ok: true, profiles });
  } catch (error) {
    console.error("Failed to load birthday profiles:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to load birthday profiles." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { ok: false, message: "A name is required." },
        { status: 400 }
      );
    }

    const profile = await prisma.birthdayProfile.create({
      data: {
        name,
        role: String(body.role ?? "").trim(),
        category: String(body.category ?? "").trim(),
        month: Math.min(12, Math.max(1, Number(body.month) || 1)),
        day: Math.min(31, Math.max(1, Number(body.day) || 1)),
        photoUrl: String(body.photoUrl ?? "").trim(),
        notes: String(body.notes ?? "").trim(),
        preferredTone: String(body.preferredTone ?? "Warm"),
      },
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("Failed to create birthday profile:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create birthday profile." },
      { status: 500 }
    );
  }
}
