import { NextResponse } from "next/server";
import { ensureMorrowAccount } from "@/lib/morrow-accounts";
import { prisma } from "@/lib/prisma";
import {
  createMorrowSession,
  passwordValidationMessage,
  setMorrowSessionCookie,
} from "@/lib/morrow-session";
import { createMorrowSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");
    const passwordIssue = passwordValidationMessage(password);
    if (passwordIssue) {
      return NextResponse.json(
        { ok: false, message: passwordIssue },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { ok: false, message: "The passwords do not match." },
        { status: 400 }
      );
    }

    const supabase = await createMorrowSupabaseServerClient();
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      return NextResponse.json(
        { ok: false, message: "Open a fresh recovery link and try again." },
        { status: 401 }
      );
    }

    const user = await ensureMorrowAccount(data.user, {
      requestAccess: Boolean(data.user.email_confirmed_at),
    });
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return NextResponse.json(
        { ok: false, message: updateError.message },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.morrowUser.update({
        where: { id: user.id },
        data: {
          passwordHash: null,
          passwordChangedAt: new Date(),
          failedLoginCount: 0,
          lockedUntil: null,
        },
      }),
      prisma.morrowAuthSession.deleteMany({ where: { userId: user.id } }),
    ]);

    if (user.status !== "ACTIVE") {
      await supabase.auth.signOut();
      return NextResponse.json({
        ok: true,
        authenticated: false,
        message: "Password updated. Your account is awaiting owner approval.",
      });
    }

    const { token } = await createMorrowSession(user.id, request);
    await setMorrowSessionCookie(token, request);
    return NextResponse.json({
      ok: true,
      authenticated: true,
      message: "Password updated.",
    });
  } catch (error) {
    console.error("Failed to update Supabase password:", error);
    return NextResponse.json(
      { ok: false, message: "The password could not be updated." },
      { status: 500 }
    );
  }
}
