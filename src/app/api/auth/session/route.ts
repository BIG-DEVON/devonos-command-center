import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getCurrentMorrowSession,
  revokeCurrentMorrowSession,
} from "@/lib/morrow-session";
import { createMorrowSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentMorrowSession({ touch: false });
    if (!session) {
      return NextResponse.json({ ok: true, authenticated: false, user: null });
    }

    const supabase = await createMorrowSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    const account = await prisma.morrowUser.findUnique({
      where: { id: session.userId },
      select: { supabaseUserId: true },
    });
    if (
      error ||
      !data.user ||
      !account?.supabaseUserId ||
      account.supabaseUserId !== data.user.id
    ) {
      await revokeCurrentMorrowSession();
      return NextResponse.json({ ok: true, authenticated: false, user: null });
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      user: {
        displayName: session.displayName,
        email: session.email,
        role: session.role,
      },
    });
  } catch (error) {
    console.error("Failed to inspect Morrow session:", error);
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        message: "Morrow could not verify this session.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await createMorrowSupabaseServerClient();
    await supabase.auth.signOut();
    await revokeCurrentMorrowSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to revoke Morrow session:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not close this session." },
      { status: 500 }
    );
  }
}
