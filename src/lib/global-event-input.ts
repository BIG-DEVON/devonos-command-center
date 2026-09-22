export const GLOBAL_EVENT_CATEGORIES = [
  "Global Observance",
  "National Day",
  "Internal Event",
  "Tax & Revenue",
  "Public Service",
  "Media & Communication",
  "Custom",
] as const;

export const GLOBAL_EVENT_RELEVANCE = ["High", "Medium", "Low"] as const;
export const GLOBAL_EVENT_STATUSES = [
  "Idea",
  "Drafting",
  "Approved",
  "Posted",
  "Skipped",
] as const;

export type GlobalEventWrite = {
  title: string;
  date: string;
  category: string;
  relevance: string;
  status: string;
  contentAngle: string;
  visualDirection: string;
  captionDraft: string;
  notes: string;
};

type ParsedGlobalEvent =
  | { ok: true; data: Partial<GlobalEventWrite> }
  | { ok: false; message: string };

const textLimits = {
  title: 140,
  contentAngle: 2_000,
  visualDirection: 2_000,
  captionDraft: 5_000,
  notes: 5_000,
} as const;

function owns(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function validDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseGlobalEventInput(
  input: unknown,
  options: { partial?: boolean } = {}
): ParsedGlobalEvent {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, message: "Send a valid event object." };
  }

  const value = input as Record<string, unknown>;
  const partial = options.partial ?? false;
  const data: Partial<GlobalEventWrite> = {};

  for (const field of Object.keys(textLimits) as Array<
    keyof typeof textLimits
  >) {
    if (partial && !owns(value, field)) continue;
    const text = String(value[field] ?? "").trim();
    if (field === "title" && text.length < 2) {
      return { ok: false, message: "Use an event title with at least 2 characters." };
    }
    if (text.length > textLimits[field]) {
      return {
        ok: false,
        message: `${field} is longer than Morrow’s ${textLimits[field]} character limit.`,
      };
    }
    data[field] = text;
  }

  if (!partial || owns(value, "date")) {
    const date = String(value.date ?? "").trim();
    if (!validDateKey(date)) {
      return { ok: false, message: "Use a real event date in YYYY-MM-DD format." };
    }
    data.date = date;
  }

  const enumFields = [
    {
      field: "category",
      values: GLOBAL_EVENT_CATEGORIES,
      fallback: "Global Observance",
    },
    {
      field: "relevance",
      values: GLOBAL_EVENT_RELEVANCE,
      fallback: "Medium",
    },
    {
      field: "status",
      values: GLOBAL_EVENT_STATUSES,
      fallback: "Idea",
    },
  ] as const;

  for (const definition of enumFields) {
    if (partial && !owns(value, definition.field)) continue;
    const candidate = String(
      value[definition.field] ?? definition.fallback
    ).trim();
    if (!(definition.values as readonly string[]).includes(candidate)) {
      return {
        ok: false,
        message: `${definition.field} is not an allowed Morrow value.`,
      };
    }
    data[definition.field] = candidate;
  }

  if (partial && Object.keys(data).length === 0) {
    return { ok: false, message: "Choose at least one event field to update." };
  }

  return { ok: true, data };
}
