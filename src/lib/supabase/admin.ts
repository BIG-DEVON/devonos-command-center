import { createClient } from "@supabase/supabase-js";
import {
  requireSupabasePublicConfig,
} from "@/lib/supabase/config";
import { isSupabaseAdminConfigured } from "@/lib/supabase/server-config";

export function createMorrowSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase server credentials are not configured.");
  }
  const { url } = requireSupabasePublicConfig();
  return createClient(url, process.env.SUPABASE_SECRET_KEY!.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
