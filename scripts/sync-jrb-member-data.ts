import "dotenv/config";

import { hallOfFameMembers } from "../src/data/hall-of-fame-members";
import { memberBirthdayDates } from "../src/data/member-birthday-dates";
import { prisma } from "../src/lib/prisma";

const legacyBirthdayProfileIds = [
  "birthday-anambra-ikeazor-okonkwo",
  "birthday-ebonyi-omo-isu-christopher",
  "birthday-nis-saidu-bashir-daura",
  "birthday-nrs-bolaji-akintola",
  "birthday-ondo-bayo-rojugbokan",
  "birthday-rmafc-isiaka-m-hamisi",
];

async function main() {
  const memberByPhotoNumber = new Map(
    hallOfFameMembers.map((member) => [member.photoNumber, member])
  );

  await prisma.$transaction(
    async (transaction) => {
      for (const member of hallOfFameMembers) {
        await transaction.hallOfFameMemberRecord.upsert({
          where: { id: member.id },
          update: {
            photoNumber: member.photoNumber,
            name: member.name,
            designation: member.designation,
            organization: member.organization,
            group: member.group,
            status: member.status,
            photoUrl: member.photoUrl,
            birthdayCategory: member.birthdayCategory,
          },
          create: {
            id: member.id,
            photoNumber: member.photoNumber,
            name: member.name,
            designation: member.designation,
            organization: member.organization,
            group: member.group,
            status: member.status,
            photoUrl: member.photoUrl,
            birthdayCategory: member.birthdayCategory,
          },
        });
      }

      for (const birthday of memberBirthdayDates) {
        const member = memberByPhotoNumber.get(birthday.photoNumber);
        if (!member) {
          throw new Error(
            `Missing hall-of-fame member for photo ${birthday.photoNumber}.`
          );
        }

        const data = {
          name: member.name,
          role: [member.designation, member.organization]
            .filter(Boolean)
            .join(" · "),
          category: member.birthdayCategory,
          month: birthday.month,
          day: birthday.day,
          photoUrl: member.photoUrl,
          hallMemberId: member.id,
        };

        await transaction.birthdayProfile.upsert({
          where: {
            id: `birthday-jrb-${String(birthday.photoNumber).padStart(2, "0")}`,
          },
          update: data,
          create: {
            id: `birthday-jrb-${String(birthday.photoNumber).padStart(2, "0")}`,
            ...data,
          },
        });
      }

      await transaction.birthdayProfile.deleteMany({
        where: { id: { in: legacyBirthdayProfileIds } },
      });
    },
    { maxWait: 10_000, timeout: 60_000 }
  );

  const [memberCount, birthdayCount, linkedBirthdayCount] = await Promise.all([
    prisma.hallOfFameMemberRecord.count(),
    prisma.birthdayProfile.count(),
    prisma.birthdayProfile.count({ where: { hallMemberId: { not: null } } }),
  ]);

  console.log(
    JSON.stringify(
      { memberCount, birthdayCount, linkedBirthdayCount },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
