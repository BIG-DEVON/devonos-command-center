import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBirthdayDate } from "@/lib/birthday-content";

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

    const month = Number(body.month);
    const day = Number(body.day);

    if (!isValidBirthdayDate(month, day)) {
      return NextResponse.json(
        { ok: false, message: "A valid birthday month and day are required." },
        { status: 400 }
      );
    }

    const profile = await prisma.birthdayProfile.create({
      data: {
        name,
        role: String(body.role ?? "").trim(),
        category: String(body.category ?? "").trim(),
        month,
        day,
        photoUrl: String(body.photoUrl ?? "").trim(),
        hallMemberId: String(body.hallMemberId ?? "").trim() || null,
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
