import { NextResponse } from "next/server";
import { ensureMorrowAccount, morrowAuthCallbackUrl } from "@/lib/morrow-accounts";
import {
  normalizeMorrowEmail,
  passwordValidationMessage,
} from "@/lib/morrow-session";
import { createMorrowSupabaseServerClient } from "@/lib/supabase/server";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const displayName = String(body.displayName ?? "").trim();
    const email = normalizeMorrowEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (displayName.length < 2 || displayName.length > 80) {
      return NextResponse.json(
        { ok: false, message: "Use a name between 2 and 80 characters." },
        { status: 400 }
      );
    }
    if (!validEmail(email) || email.length > 254) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: morrowAuthCallbackUrl(
          request,
          "/login?verified=1&pending=1"
        ),
      },
    });
    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status === 429 ? 429 : 400 }
      );
    }

    if (data.user && (data.user.identities?.length ?? 0) > 0) {
      await ensureMorrowAccount(data.user, { displayName });
    }
    await supabase.auth.signOut();

    return NextResponse.json(
      {
        ok: true,
        message:
          "Check your email to verify your address. Your account will then be sent for owner approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create Morrow account:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not create the account." },
      { status: 500 }
    );
  }
}
