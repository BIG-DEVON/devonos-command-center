import { localDateKey } from "@/lib/date";

export type BirthdayTone = "Formal" | "Warm" | "Public";

type BirthdayMessageProfile = {
  name: string;
  role?: string;
  preferredTone: BirthdayTone;
};

export function isValidBirthdayDate(month: number, day: number) {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1) return false;

  return day <= new Date(2024, month, 0).getDate();
}

export function getNextBirthdayDate(
  month: number,
  day: number,
  from = new Date()
) {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);

  let birthday = new Date(today.getFullYear(), month - 1, day);
  birthday.setHours(0, 0, 0, 0);

  if (birthday.getTime() < today.getTime()) {
    birthday = new Date(today.getFullYear() + 1, month - 1, day);
    birthday.setHours(0, 0, 0, 0);
  }

  return birthday;
}

export function getDaysUntilBirthday(
  month: number,
  day: number,
  from = new Date()
) {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  const birthday = getNextBirthdayDate(month, day, today);

  return Math.round(
    (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function birthdayDateKey(month: number, day: number) {
  return localDateKey(getNextBirthdayDate(month, day));
}

export function formatBirthdayDate(month: number, day: number) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
  }).format(new Date(2024, month - 1, day));
}

export function formatBirthdayStatus(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days} days away`;
  if (days === 7) return "One week away";
  if (days < 30) return `${days} days away`;
  if (days < 60) return "Next month";
  return `${days} days away`;
}

export function buildBirthdayMessage(profile: BirthdayMessageProfile) {
  const roleLine = profile.role?.trim()
    ? ` Your leadership and service as ${profile.role.trim()} continue to make a meaningful difference.`
    : "";

  if (profile.preferredTone === "Warm") {
    return `Happy Birthday, ${profile.name}.

Wishing you a beautiful day filled with joy, peace, laughter, and every good thing your heart desires.

May this new year bring you greater strength, deeper fulfilment, and more reasons to smile.

Have a truly amazing birthday.`;
  }

  if (profile.preferredTone === "Public") {
    return `Happy Birthday, ${profile.name}.

Today, we celebrate your service, dedication, and valuable contributions.${roleLine}

May this new year bring renewed strength, greater accomplishments, good health, and continued success.

Wishing you a wonderful birthday celebration.`;
  }

  return `Happy Birthday, ${profile.name}.

On this special day, we celebrate your leadership, service, and invaluable contributions.${roleLine}

May this new year bring you renewed strength, wisdom, good health, greater achievements, and continued fulfilment.

Wishing you a memorable and joyful birthday celebration.`;
}
