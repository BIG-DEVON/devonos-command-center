export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  return { url, publishableKey };
}

export function isSupabasePublicConfigured() {
  const { url, publishableKey } = getSupabasePublicConfig();
  return Boolean(url && publishableKey);
}

export function requireSupabasePublicConfig() {
  const config = getSupabasePublicConfig();
  if (!config.url || !config.publishableKey) {
    throw new Error("Supabase public credentials are not configured.");
  }
  return config;
}
