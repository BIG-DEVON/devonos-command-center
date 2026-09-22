import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { ensureMorrowAccount } from "@/lib/morrow-accounts";
import { createMorrowSupabaseServerClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/login";
  }
  return value;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const supabase = await createMorrowSupabaseServerClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing authentication token.") };

  if (error) {
    const failed = new URL("/login", request.url);
    failed.searchParams.set("authError", "link");
    return NextResponse.redirect(failed);
  }

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    const failed = new URL("/login", request.url);
    failed.searchParams.set("authError", "link");
    return NextResponse.redirect(failed);
  }

  const isRecovery = type === "recovery" || next.includes("recovery=1");
  const account = await ensureMorrowAccount(data.user, {
    requestAccess: !isRecovery,
  });
  if (isRecovery) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  await supabase.auth.signOut();
  const destination = new URL("/login", request.url);
  destination.searchParams.set("verified", "1");
  if (account.status !== "ACTIVE") destination.searchParams.set("pending", "1");
  return NextResponse.redirect(destination);
}
