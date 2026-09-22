import { NextResponse } from "next/server";
import { getCurrentMorrowSession } from "@/lib/morrow-session";
import { createMorrowSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import {
  getMorrowAuthProvider,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/server-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentMorrowSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sign in to inspect integrations." },
      { status: 401 }
    );
  }
  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, message: "Owner or Admin access is required." },
      { status: 403 }
    );
  }

  const { url } = getSupabasePublicConfig();
  const projectRef = url.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
  const databaseConfigured = Boolean(
    process.env.SUPABASE_DATABASE_URL?.trim() &&
      process.env.SUPABASE_DIRECT_URL?.trim()
  );
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      ok: true,
      connected: false,
      projectRef,
      databaseConfigured,
      authProvider: getMorrowAuthProvider(),
      userCount: 0,
    });
  }

  try {
    const supabase = createMorrowSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      connected: true,
      projectRef,
      databaseConfigured,
      authProvider: getMorrowAuthProvider(),
      userCount: data.total ?? data.users.length,
    });
  } catch (error) {
    console.error("Failed to inspect Supabase:", error);
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        projectRef,
        databaseConfigured,
        authProvider: getMorrowAuthProvider(),
        message: "Morrow could not verify the Supabase connection.",
      },
      { status: 502 }
    );
  }
}
