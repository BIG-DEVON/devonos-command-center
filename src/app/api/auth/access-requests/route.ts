import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMorrowSession } from "@/lib/morrow-session";

function canReview(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

export async function GET() {
  const session = await getCurrentMorrowSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sign in to review access requests." },
      { status: 401 }
    );
  }
  if (!canReview(session.role)) {
    return NextResponse.json(
      { ok: false, message: "Owner or Admin access is required." },
      { status: 403 }
    );
  }

  const [requests, users] = await Promise.all([
    prisma.morrowAccessRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.morrowUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        displayName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, requests, users });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "Create an account and verify your email to request access.",
    },
    { status: 410 }
  );
}
