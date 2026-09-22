"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabasePublicConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient | undefined;

export function createMorrowSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  const { url, publishableKey } = requireSupabasePublicConfig();
  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
