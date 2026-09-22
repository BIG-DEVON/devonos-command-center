import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createMorrowSession,
  getCurrentMorrowSession,
  passwordValidationMessage,
  setMorrowSessionCookie,
} from "@/lib/morrow-session";
import { createMorrowSupabaseServerClient } from "@/lib/supabase/server";

function unauthorized() {
  return NextResponse.json(
    { ok: false, message: "Sign in to manage workspace security." },
    { status: 401 }
  );
}

export async function GET() {
  const current = await getCurrentMorrowSession();
  if (!current) return unauthorized();

  const [owner, sessions] = await Promise.all([
    prisma.morrowUser.findUnique({ where: { id: current.userId } }),
    prisma.morrowAuthSession.findMany({
      where: {
        userId: current.userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastSeenAt: "desc" },
      select: {
        id: true,
        userAgent: true,
        createdAt: true,
        lastSeenAt: true,
        expiresAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    owner: owner
      ? {
          displayName: owner.displayName,
          email: owner.email,
          role: owner.role,
          createdAt: owner.createdAt,
          lastLoginAt: owner.lastLoginAt,
          passwordChangedAt: owner.passwordChangedAt,
        }
      : null,
    sessions: sessions.map((session) => ({
      ...session,
      current: session.id === current.id,
    })),
  });
}

export async function DELETE() {
  const current = await getCurrentMorrowSession();
  if (!current) return unauthorized();

  const result = await prisma.morrowAuthSession.deleteMany({
    where: {
      userId: current.userId,
      id: { not: current.id },
    },
  });

  return NextResponse.json({
    ok: true,
    revoked: result.count,
    message:
      result.count > 0
        ? `${result.count} other session${result.count === 1 ? "" : "s"} revoked.`
        : "This is your only active session.",
  });
}

export async function PATCH(request: Request) {
  const current = await getCurrentMorrowSession();
  if (!current) return unauthorized();

  try {
    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");
    const owner = await prisma.morrowUser.findUnique({
      where: { id: current.userId },
    });
    if (!owner) return unauthorized();

    const supabase = await createMorrowSupabaseServerClient();
    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: owner.email,
        password: currentPassword,
      });
    if (
      signInError ||
      !authData.user ||
      !owner.supabaseUserId ||
      authData.user.id !== owner.supabaseUserId
    ) {
      return NextResponse.json(
        { ok: false, message: "The current password is incorrect." },
        { status: 401 }
      );
    }

    const passwordIssue = passwordValidationMessage(newPassword);
    if (passwordIssue) {
      return NextResponse.json(
        { ok: false, message: passwordIssue },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { ok: false, message: "The new passwords do not match." },
        { status: 400 }
      );
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.morrowUser.update({
        where: { id: owner.id },
        data: {
          passwordHash: null,
          passwordChangedAt: new Date(),
          failedLoginCount: 0,
          lockedUntil: null,
        },
      }),
      prisma.morrowAuthSession.deleteMany({
        where: { userId: owner.id },
      }),
    ]);

    const { token } = await createMorrowSession(owner.id, request);
    await setMorrowSessionCookie(token, request);

    return NextResponse.json({
      ok: true,
      message: "Password changed. Every other session was signed out.",
    });
  } catch (error) {
    console.error("Failed to update Morrow password:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not update the password." },
      { status: 500 }
    );
  }
}
