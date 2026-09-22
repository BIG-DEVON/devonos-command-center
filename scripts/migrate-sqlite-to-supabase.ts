import { config as loadEnvironment } from "dotenv";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as SqlitePrismaClient } from "../src/generated/prisma-sqlite/client";
import { PrismaClient as PostgresPrismaClient } from "../src/generated/prisma-postgres/client";

loadEnvironment({ path: ".env" });
loadEnvironment({ path: ".env.local", override: true });

const targetUrl = process.env.SUPABASE_DIRECT_URL?.trim();
if (!targetUrl || targetUrl.includes("[YOUR-PASSWORD]")) {
  throw new Error(
    "SUPABASE_DIRECT_URL must contain the real database password."
  );
}

const source = new SqlitePrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./devonos.db",
  }),
});
const target = new PostgresPrismaClient({
  adapter: new PrismaPg({ connectionString: targetUrl }),
});

const delegates = [
  "morrowUser",
  "hallOfFameMemberRecord",
  "workspaceSettings",
  "newsItem",
  "newsSourceState",
  "newsMonitorRun",
  "newsDigest",
  "notificationRecord",
  "pushSubscriptionRecord",
  "automationSchedule",
  "automationRun",
  "approvalRequest",
  "kpiItem",
  "socialDraft",
  "assetRecord",
  "globalEvent",
  "aiDraft",
  "projectRecord",
  "autopilotTask",
  "executiveReportSnapshot",
  "morrowAuthSession",
  "morrowAccessRequest",
  "morrowAuthChallenge",
  "notificationDelivery",
  "approvalActivity",
  "birthdayProfile",
] as const;

type DelegateName = (typeof delegates)[number];

type MigrationDelegate = {
  count(): Promise<number>;
  findMany(): Promise<Array<Record<string, unknown>>>;
  createMany(input: {
    data: Array<Record<string, unknown>>;
  }): Promise<{ count: number }>;
};

function delegate(client: object, name: DelegateName) {
  return (client as unknown as Record<DelegateName, MigrationDelegate>)[name];
}

async function main() {
  const sourceData = new Map<
    DelegateName,
    Array<Record<string, unknown>>
  >();

  for (const name of delegates) {
    const sourceDelegate = delegate(source, name);
    const targetDelegate = delegate(target, name);
    const [records, targetCount] = await Promise.all([
      sourceDelegate.findMany(),
      targetDelegate.count(),
    ]);
    if (targetCount !== 0) {
      throw new Error(
        `Target ${name} already contains ${targetCount} records. Migration stopped without writing.`
      );
    }
    sourceData.set(name, records);
  }

  await target.$transaction(async (transaction) => {
    for (const name of delegates) {
      const records = sourceData.get(name) ?? [];
      if (records.length > 0) {
        await delegate(transaction, name).createMany({ data: records });
      }
    }
  });

  const verification: Record<
    string,
    { source: number; target: number; matches: boolean }
  > = {};
  for (const name of delegates) {
    const targetDelegate = delegate(target, name);
    const sourceCount = sourceData.get(name)?.length ?? 0;
    const targetCount = await targetDelegate.count();
    verification[name] = {
      source: sourceCount,
      target: targetCount,
      matches: sourceCount === targetCount,
    };
  }

  if (Object.values(verification).some(({ matches }) => !matches)) {
    throw new Error(
      `Post-migration verification failed: ${JSON.stringify(verification)}`
    );
  }
  console.log(JSON.stringify({ ok: true, verification }, null, 2));
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    let redacted = message;
    for (const secret of [
      process.env.SUPABASE_DATABASE_URL,
      process.env.SUPABASE_DIRECT_URL,
    ]) {
      if (secret) redacted = redacted.replaceAll(secret, "[redacted database URL]");
    }
    console.error(
      redacted.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted database URL]")
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  });
