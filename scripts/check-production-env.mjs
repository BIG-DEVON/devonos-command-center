if (process.env.VERCEL_ENV === "production") {
  const required = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_DATABASE_URL",
    "SUPABASE_DB_CA_CERT",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
    "CRON_SECRET",
    "RESEND_API_KEY",
    "MORROW_EMAIL_FROM",
  ];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Production environment is missing: ${missing.join(", ")}`);
  }

  function parseUrl(name) {
    try {
      return new URL(process.env[name]);
    } catch {
      throw new Error(`${name} must be a valid URL.`);
    }
  }

  const site = parseUrl("NEXT_PUBLIC_SITE_URL");
  const supabase = parseUrl("NEXT_PUBLIC_SUPABASE_URL");
  const database = parseUrl("SUPABASE_DATABASE_URL");
  if (
    site.protocol !== "https:" ||
    site.hostname === "localhost" ||
    site.pathname !== "/" ||
    site.search ||
    site.hash
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public HTTPS origin in production.");
  }
  if (supabase.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use HTTPS in production.");
  }
  if (!["postgres:", "postgresql:"].includes(database.protocol)) {
    throw new Error("SUPABASE_DATABASE_URL must be a Postgres connection URL.");
  }
  if (!process.env.SUPABASE_DB_CA_CERT.includes("BEGIN CERTIFICATE")) {
    throw new Error("SUPABASE_DB_CA_CERT must contain the Supabase database CA certificate.");
  }
  if (process.env.CRON_SECRET.trim().length < 16) {
    throw new Error("CRON_SECRET must be at least 16 characters long.");
  }
  if (!/^.+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/.test(process.env.MORROW_EMAIL_FROM.trim())) {
    throw new Error("MORROW_EMAIL_FROM must include a sender name and email address.");
  }
  if (process.env.MORROW_EMAIL_FROM.includes("your-domain.com")) {
    throw new Error("MORROW_EMAIL_FROM must use a verified sending domain.");
  }
}
