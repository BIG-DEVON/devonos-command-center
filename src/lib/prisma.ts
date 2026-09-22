import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.SUPABASE_DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error("SUPABASE_DATABASE_URL is required for Morrow data.");
}

const certificate = process.env.SUPABASE_DB_CA_CERT?.replace(/\\n/g, "\n").trim();
if (process.env.VERCEL_ENV === "production" && !certificate) {
  throw new Error("SUPABASE_DB_CA_CERT is required for verified production database TLS.");
}

const adapter = new PrismaPg({
  connectionString,
  ssl: certificate
    ? { ca: certificate, rejectUnauthorized: true }
    : { rejectUnauthorized: false },
  max: process.env.VERCEL_ENV ? 1 : 5,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
