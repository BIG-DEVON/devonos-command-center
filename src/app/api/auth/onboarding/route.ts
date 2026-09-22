import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMorrowSession } from "@/lib/morrow-session";

export async function PATCH() {
  const session = await getCurrentMorrowSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sign in to update onboarding." },
      { status: 401 }
    );
  }

  await prisma.morrowUser.update({
    where: { id: session.userId },
    data: { onboardingCompletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
