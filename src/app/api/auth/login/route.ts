import { NextResponse } from "next/server";
import { ensureMorrowAccount } from "@/lib/morrow-accounts";
import { prisma } from "@/lib/prisma";
import {
  createMorrowSession,
  normalizeMorrowEmail,
  setMorrowSessionCookie,
} from "@/lib/morrow-session";
import { createMorrowSupabaseServerClient } from "@/lib/supabase/server";

function invalidCredentials() {
  return NextResponse.json(
    { ok: false, message: "The email or password is incorrect." },
    { status: 401 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeMorrowEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    if (!email || !password) return invalidCredentials();

    const supabase = await createMorrowSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) return invalidCredentials();

    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { ok: false, message: "Verify your email before signing in." },
        { status: 403 }
      );
    }

    const user = await ensureMorrowAccount(data.user, { requestAccess: true });
    if (user.status !== "ACTIVE") {
      await supabase.auth.signOut();
      const messages: Record<string, string> = {
        PENDING:
          "Your email is verified and your account is awaiting owner approval.",
        REJECTED:
          "This account request was declined. Contact the workspace owner.",
        SUSPENDED:
          "This account has been suspended. Contact the workspace owner.",
        INVITED: "This account is awaiting owner approval.",
      };
      return NextResponse.json(
        {
          ok: false,
          code: user.status.toLowerCase(),
          message: messages[user.status] ?? "This account is not active.",
        },
        { status: 403 }
      );
    }

    await prisma.morrowUser.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
    const { token } = await createMorrowSession(user.id, request);
    await setMorrowSessionCookie(token, request);
    return NextResponse.json({ ok: true, message: "Welcome back." });
  } catch (error) {
    console.error("Failed to sign in to Morrow:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not complete sign in." },
      { status: 500 }
    );
  }
}
