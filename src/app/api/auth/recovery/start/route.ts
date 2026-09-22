import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { morrowAuthCallbackUrl } from "@/lib/morrow-accounts";
import { normalizeMorrowEmail } from "@/lib/morrow-session";
import { createMorrowSupabaseServerClient } from "@/lib/supabase/server";

const genericMessage =
  "If an active account exists for that email, a password-reset link is on its way.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeMorrowEmail(String(body.email ?? ""));
    const user = email
      ? await prisma.morrowUser.findUnique({ where: { email } })
      : null;

    if (user?.status === "ACTIVE" && user.supabaseUserId) {
      const supabase = await createMorrowSupabaseServerClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: morrowAuthCallbackUrl(
          request,
          "/login?recovery=1"
        ),
      });
      if (error) {
        console.error("Supabase password recovery delivery failed:", error);
      }
    }

    return NextResponse.json({ ok: true, message: genericMessage });
  } catch (error) {
    console.error("Failed to start Morrow recovery:", error);
    return NextResponse.json({ ok: true, message: genericMessage });
  }
}
