import "dotenv/config";

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { isValidBirthdayDate } from "../src/lib/birthday-content";
import { prisma } from "../src/lib/prisma";

type StaffBirthday = { name: string; month: number; day: number };

function identity(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function main() {
  const workbookPath = process.argv[2];
  const apply = process.argv.includes("--apply");
  if (!workbookPath) {
    throw new Error("Usage: import-jrb-staff-birthdays.ts workbook.xlsx [--apply]");
  }

  const output = execFileSync(
    "python3",
    [resolve("scripts/read-jrb-staff-birthdays.py"), workbookPath],
    { encoding: "utf8", maxBuffer: 1024 * 1024 }
  );
  const source = JSON.parse(output) as StaffBirthday[];
  if (source.length === 0 || source.some((person) =>
    !person.name.trim() || !isValidBirthdayDate(person.month, person.day)
  )) {
    throw new Error("The staff birthday list is empty or contains an invalid entry.");
  }

  const existing = await prisma.birthdayProfile.findMany({
    select: { id: true, name: true, category: true, month: true, day: true },
  });
  const byName = new Map(existing.map((profile) => [identity(profile.name), profile]));
  const toCreate = [];
  const conflicts = [];
  let alreadyPresent = 0;

  for (const person of source) {
    const normalizedName = identity(person.name);
    const match = byName.get(normalizedName);
    if (match) {
      if (match.month !== person.month || match.day !== person.day) {
        conflicts.push({ name: person.name, existing: `${match.month}/${match.day}`, source: `${person.month}/${person.day}` });
      } else {
        alreadyPresent++;
      }
      continue;
    }
    toCreate.push({
      id: `birthday-jrb-staff-${createHash("sha256").update(normalizedName).digest("hex").slice(0, 20)}`,
      name: person.name,
      role: "JRB Secretariat staff",
      category: "JRB Staff",
      month: person.month,
      day: person.day,
    });
  }

  if (conflicts.length > 0) {
    console.error(JSON.stringify({ conflicts }, null, 2));
    throw new Error("Birthday conflicts require manual review; no entries were imported.");
  }

  if (apply && toCreate.length > 0) {
    await prisma.birthdayProfile.createMany({ data: toCreate, skipDuplicates: true });
  }
  console.log(JSON.stringify({ source: source.length, alreadyPresent, newStaff: toCreate.length, applied: apply }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
