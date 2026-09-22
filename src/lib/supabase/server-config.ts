import "server-only";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export type MorrowAuthProvider = "supabase";

export function isSupabaseAdminConfigured() {
  return Boolean(
    isSupabasePublicConfigured() && process.env.SUPABASE_SECRET_KEY?.trim()
  );
}

export function getMorrowAuthProvider(): MorrowAuthProvider {
  return "supabase";
}
