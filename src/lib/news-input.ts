const statuses = ["New", "Shortlisted", "Included", "Dismissed"] as const;
const relevances = ["High", "Medium", "Low"] as const;
const channels = [
  "Newspaper",
  "Broadcaster",
  "Official",
  "X",
  "Instagram",
  "Manual",
] as const;
const contentTypes = [
  "Article",
  "Press release",
  "Post",
  "Manual signal",
] as const;

type NewsInput = {
  headline?: string;
  source?: string;
  sourceKey?: string;
  sourceDomain?: string;
  channel?: (typeof channels)[number];
  contentType?: (typeof contentTypes)[number];
  url?: string;
  author?: string;
  summary?: string;
  relevance?: (typeof relevances)[number];
  topic?: string;
  score?: number;
  status?: (typeof statuses)[number];
  notes?: string;
  publishedAt?: Date | null;
};

function text(value: unknown, field: string, max: number) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length > max) {
    throw new Error(`${field} must be ${max} characters or less.`);
  }
  return normalized;
}

function choice<T extends readonly string[]>(
  value: unknown,
  values: T,
  field: string
) {
  if (!values.includes(value as T[number])) {
    throw new Error(`${field} is not supported.`);
  }
  return value as T[number];
}

function webUrl(value: unknown) {
  const normalized = text(value, "URL", 2_000);
  if (!normalized) return "";
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }
    return parsed.toString();
  } catch {
    throw new Error("Use a valid http or https source URL.");
  }
}

function date(value: unknown) {
  if (value === null || value === "") return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Published date is invalid.");
  }
  return parsed;
}

export function validateNewsInput(
  body: Record<string, unknown>,
  options: { partial?: boolean } = {}
) {
  const partial = options.partial === true;
  const output: NewsInput = {};

  if (!partial || body.headline !== undefined) {
    const headline = text(body.headline, "Headline", 280);
    if (!partial && !headline) throw new Error("A headline is required.");
    output.headline = headline;
  }
  if (!partial || body.source !== undefined) {
    output.source = text(body.source, "Source", 160);
  }
  if (!partial || body.sourceKey !== undefined) {
    output.sourceKey = text(body.sourceKey ?? "manual", "Source key", 120) || "manual";
  }
  if (!partial || body.sourceDomain !== undefined) {
    output.sourceDomain = text(body.sourceDomain, "Source domain", 180);
  }
  if (!partial || body.channel !== undefined) {
    output.channel = choice(body.channel ?? "Manual", channels, "Channel");
  }
  if (!partial || body.contentType !== undefined) {
    output.contentType = choice(
      body.contentType ?? "Manual signal",
      contentTypes,
      "Content type"
    );
  }
  if (!partial || body.url !== undefined) output.url = webUrl(body.url);
  if (!partial || body.author !== undefined) {
    output.author = text(body.author, "Author", 160);
  }
  if (!partial || body.summary !== undefined) {
    output.summary = text(body.summary, "Summary", 2_000);
  }
  if (!partial || body.relevance !== undefined) {
    output.relevance = choice(
      body.relevance ?? "Medium",
      relevances,
      "Relevance"
    );
  }
  if (!partial || body.topic !== undefined) {
    output.topic = text(body.topic ?? "Manual signal", "Topic", 120) || "Manual signal";
  }
  if (!partial || body.score !== undefined) {
    const score = Number(body.score ?? 0);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error("Score must be between 0 and 100.");
    }
    output.score = Math.round(score);
  }
  if (!partial || body.status !== undefined) {
    output.status = choice(body.status ?? "New", statuses, "Status");
  }
  if (!partial || body.notes !== undefined) {
    output.notes = text(body.notes, "Notes", 2_000);
  }
  if (!partial || body.publishedAt !== undefined) {
    output.publishedAt = date(body.publishedAt);
  }

  if (partial && Object.keys(output).length === 0) {
    throw new Error("No supported news fields were provided.");
  }

  return output;
}
