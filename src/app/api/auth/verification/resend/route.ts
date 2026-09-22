import { NextResponse } from "next/server";
import { morrowAuthCallbackUrl } from "@/lib/morrow-accounts";
import { prisma } from "@/lib/prisma";
import { normalizeMorrowEmail } from "@/lib/morrow-session";
import { createMorrowSupabaseServerClient } from "@/lib/supabase/server";

const genericMessage =
  "If that account still needs verification, a new email is on its way.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeMorrowEmail(String(body.email ?? ""));
    const account = email
      ? await prisma.morrowUser.findUnique({ where: { email } })
      : null;
    if (account?.status === "PENDING" && account.supabaseUserId) {
      const supabase = await createMorrowSupabaseServerClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: morrowAuthCallbackUrl(
            request,
            "/login?verified=1&pending=1"
          ),
        },
      });
      if (error?.status === 429) {
        return NextResponse.json(
          { ok: false, message: "Please wait before requesting another email." },
          { status: 429 }
        );
      }
      if (error) console.error("Supabase verification resend failed:", error);
    }
    return NextResponse.json({ ok: true, message: genericMessage });
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    return NextResponse.json({ ok: true, message: genericMessage });
  }
}
