import { hallOfFameMembers } from "@/data/hall-of-fame-members";
import { memberBirthdayDates } from "@/data/member-birthday-dates";
import { prisma } from "@/lib/prisma";

export const hallMemberGroups = [
  "JRB Leadership",
  "State Revenue",
  "Partner Agency",
  "Needs verification",
] as const;

export const hallMemberStatuses = [
  "verified",
  "name-pending",
  "verification-required",
] as const;

export const hallMemberSelect = {
  id: true,
  photoNumber: true,
  name: true,
  designation: true,
  organization: true,
  group: true,
  status: true,
  photoUrl: true,
  photoMimeType: true,
  birthdayCategory: true,
  createdAt: true,
  updatedAt: true,
} as const;

type HallMemberRow = {
  id: string;
  photoNumber: number;
  name: string;
  designation: string;
  organization: string;
  group: string;
  status: string;
  photoUrl: string;
  photoMimeType: string;
  birthdayCategory: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalizedIdentity(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function birthdayCategoryForGroup(group: string) {
  if (group === "JRB Leadership") return "Board Member";
  if (group === "Partner Agency") return "External Partner";
  return "Stakeholder";
}

export function isHallMemberGroup(value: string) {
  return hallMemberGroups.some((group) => group === value);
}

export function isHallMemberStatus(value: string) {
  return hallMemberStatuses.some((status) => status === value);
}

export function hallMemberPhotoUrl(member: HallMemberRow) {
  return member.photoMimeType
    ? `/api/hall-of-fame/${member.id}/photo?v=${member.updatedAt.getTime()}`
    : member.photoUrl;
}

export function serializeHallMember(member: HallMemberRow) {
  const photoUrl = hallMemberPhotoUrl(member);
  return {
    id: member.id,
    photoNumber: member.photoNumber,
    name: member.name,
    designation: member.designation,
    organization: member.organization,
    group: member.group,
    status: member.status,
    photoUrl,
    hasPhoto: Boolean(photoUrl),
    birthdayCategory: member.birthdayCategory,
    updatedAt: member.updatedAt.toISOString(),
  };
}

export async function ensureHallOfFameSeeded() {
  const count = await prisma.hallOfFameMemberRecord.count();
  if (count > 0) return;

  await prisma.$transaction(
    async (transaction) => {
      for (const member of hallOfFameMembers) {
        await transaction.hallOfFameMemberRecord.upsert({
          where: { id: member.id },
          update: {},
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
        const member = hallOfFameMembers.find(
          (candidate) => candidate.photoNumber === birthday.photoNumber
        );

        if (!member) {
          throw new Error(
            `Missing hall-of-fame member for photo ${birthday.photoNumber}.`
          );
        }

        await transaction.birthdayProfile.upsert({
          where: {
            id: `birthday-jrb-${String(birthday.photoNumber).padStart(2, "0")}`,
          },
          update: {},
          create: {
            id: `birthday-jrb-${String(birthday.photoNumber).padStart(2, "0")}`,
            name: member.name,
            role: [member.designation, member.organization]
              .filter(Boolean)
              .join(" · "),
            category: member.birthdayCategory,
            month: birthday.month,
            day: birthday.day,
            photoUrl: member.photoUrl,
            hallMemberId: member.id,
          },
        });
      }
    },
    { maxWait: 10_000, timeout: 60_000 }
  );
}

export async function getHallOfFameMembers() {
  await ensureHallOfFameSeeded();
  const members = await prisma.hallOfFameMemberRecord.findMany({
    orderBy: [{ photoNumber: "asc" }, { name: "asc" }],
    select: hallMemberSelect,
  });
  return members.map(serializeHallMember);
}

export async function nextHallPhotoNumber() {
  const aggregate = await prisma.hallOfFameMemberRecord.aggregate({
    _max: { photoNumber: true },
  });
  return (aggregate._max.photoNumber ?? 0) + 1;
}

export async function syncHallMemberBirthday(
  member: HallMemberRow,
  previousName: string,
  options: { photoChanged?: boolean } = {}
) {
  const profiles = await prisma.birthdayProfile.findMany({
    where: {
      OR: [{ hallMemberId: member.id }, { name: previousName }],
    },
    orderBy: { updatedAt: "desc" },
  });
  const linked =
    profiles.find((profile) => profile.hallMemberId === member.id) ??
    profiles.find(
      (profile) =>
        normalizedIdentity(profile.name) === normalizedIdentity(previousName)
    );
  if (!linked) return;

  await prisma.birthdayProfile.update({
    where: { id: linked.id },
    data: {
      hallMemberId: member.id,
      name: member.name,
      role: [member.designation, member.organization]
        .filter(Boolean)
        .join(" · "),
      category: member.birthdayCategory,
      photoUrl: options.photoChanged
        ? hallMemberPhotoUrl(member)
        : undefined,
    },
  });
}

export async function detachHallMemberBirthday(
  memberId: string,
  memberName: string
) {
  const profiles = await prisma.birthdayProfile.findMany({
    where: {
      OR: [{ hallMemberId: memberId }, { name: memberName }],
    },
  });
  const matchingIds = profiles
    .filter(
      (profile) =>
        profile.hallMemberId === memberId ||
        normalizedIdentity(profile.name) === normalizedIdentity(memberName)
    )
    .map((profile) => profile.id);

  if (matchingIds.length === 0) return;
  await prisma.birthdayProfile.updateMany({
    where: { id: { in: matchingIds } },
    data: { hallMemberId: null, photoUrl: "" },
  });
}
