import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBirthdayDate } from "@/lib/birthday-content";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const current = await prisma.birthdayProfile.findUnique({ where: { id } });

    if (!current) {
      return NextResponse.json(
        { ok: false, message: "Birthday profile not found." },
        { status: 404 }
      );
    }

    const month =
      body.month === undefined ? current.month : Number(body.month);
    const day = body.day === undefined ? current.day : Number(body.day);

    if (!isValidBirthdayDate(month, day)) {
      return NextResponse.json(
        { ok: false, message: "A valid birthday month and day are required." },
        { status: 400 }
      );
    }

    const profile = await prisma.birthdayProfile.update({
      where: { id },
      data: {
        name: body.name === undefined ? undefined : String(body.name).trim(),
        role: body.role === undefined ? undefined : String(body.role).trim(),
        category:
          body.category === undefined ? undefined : String(body.category).trim(),
        month:
          body.month === undefined
            ? undefined
            : month,
        day:
          body.day === undefined
            ? undefined
            : day,
        photoUrl:
          body.photoUrl === undefined
            ? undefined
            : String(body.photoUrl).trim(),
        hallMemberId:
          body.hallMemberId === undefined
            ? undefined
            : String(body.hallMemberId ?? "").trim() || null,
        notes:
          body.notes === undefined ? undefined : String(body.notes).trim(),
        preferredTone:
          body.preferredTone === undefined
            ? undefined
            : String(body.preferredTone),
      },
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("Failed to update birthday profile:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update birthday profile." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.birthdayProfile.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete birthday profile:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete birthday profile." },
      { status: 500 }
    );
  }
}
