import { createHash } from "node:crypto";
import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type NewsSourceDefinition = {
  key: string;
  name: string;
  homepage: string;
  feedUrl: string;
  kind: "RSS" | "Official" | "Link" | "X" | "Instagram";
  channel: "Newspaper" | "Broadcaster" | "Official" | "X" | "Instagram";
  priority: number;
};

type CollectedArticle = {
  headline: string;
  source: string;
  sourceKey: string;
  sourceDomain: string;
  channel: "Newspaper" | "Broadcaster" | "Official" | "X" | "Instagram";
  contentType: "Article" | "Press release" | "Post";
  url: string;
  author: string;
  summary: string;
  publishedAt: Date | null;
};

type ScoredArticle = CollectedArticle & {
  fingerprint: string;
  relevance: "High" | "Medium" | "Low";
  topic: string;
  score: number;
};

type SourceResult = {
  source: NewsSourceDefinition;
  status:
    | "Healthy"
    | "Link only"
    | "Connect required"
    | "No matches"
    | "Failed";
  items: CollectedArticle[];
  error: string;
};

export const NEWS_SOURCES: NewsSourceDefinition[] = [
  {
    key: "punch-latest",
    name: "Punch · Latest",
    homepage: "https://punchng.com/",
    feedUrl: "https://rss.punchng.com/v1/category/latest_news",
    kind: "RSS",
    channel: "Newspaper",
    priority: 90,
  },
  {
    key: "punch-business",
    name: "Punch · Business",
    homepage: "https://punchng.com/topics/business/",
    feedUrl: "https://rss.punchng.com/v1/category/business",
    kind: "RSS",
    channel: "Newspaper",
    priority: 95,
  },
  {
    key: "premium-times",
    name: "Premium Times",
    homepage: "https://www.premiumtimesng.com/",
    feedUrl: "https://www.premiumtimesng.com/feed",
    kind: "RSS",
    channel: "Newspaper",
    priority: 95,
  },
  {
    key: "vanguard",
    name: "Vanguard",
    homepage: "https://www.vanguardngr.com/",
    feedUrl: "https://www.vanguardngr.com/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 80,
  },
  {
    key: "businessday",
    name: "BusinessDay",
    homepage: "https://businessday.ng/",
    feedUrl: "https://businessday.ng/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 100,
  },
  {
    key: "channels",
    name: "Channels Television",
    homepage: "https://www.channelstv.com/",
    feedUrl: "https://www.channelstv.com/feed/",
    kind: "RSS",
    channel: "Broadcaster",
    priority: 85,
  },
  {
    key: "daily-trust",
    name: "Daily Trust",
    homepage: "https://dailytrust.com/",
    feedUrl: "https://dailytrust.com/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 95,
  },
  {
    key: "thisday",
    name: "THISDAY",
    homepage: "https://www.thisdaylive.com/",
    feedUrl: "https://www.thisdaylive.com/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 100,
  },
  {
    key: "nigerian-tribune",
    name: "Nigerian Tribune",
    homepage: "https://tribuneonlineng.com/",
    feedUrl: "https://tribuneonlineng.com/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 85,
  },
  {
    key: "leadership",
    name: "Leadership",
    homepage: "https://leadership.ng/",
    feedUrl: "https://leadership.ng/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 85,
  },
  {
    key: "nairametrics",
    name: "Nairametrics",
    homepage: "https://nairametrics.com/",
    feedUrl: "https://nairametrics.com/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 100,
  },
  {
    key: "new-telegraph",
    name: "New Telegraph",
    homepage: "https://newtelegraphng.com/",
    feedUrl: "https://newtelegraphng.com/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 80,
  },
  {
    key: "the-cable",
    name: "TheCable",
    homepage: "https://www.thecable.ng/",
    feedUrl: "https://www.thecable.ng/feed/",
    kind: "RSS",
    channel: "Newspaper",
    priority: 95,
  },
  {
    key: "jrb-official",
    name: "Joint Revenue Board",
    homepage: "https://www.jrb.gov.ng/",
    feedUrl: "https://www.jrb.gov.ng/media-center",
    kind: "Official",
    channel: "Official",
    priority: 110,
  },
  {
    key: "nrs-official",
    name: "Nigeria Revenue Service",
    homepage: "https://www.nrs.gov.ng/",
    feedUrl: "https://www.nrs.gov.ng/media--updates/press-releases",
    kind: "Link",
    channel: "Official",
    priority: 110,
  },
  {
    key: "x-public-mentions",
    name: "X · Public mentions",
    homepage: "https://x.com/",
    feedUrl: "https://api.x.com/2/tweets/search/recent",
    kind: "X",
    channel: "X",
    priority: 105,
  },
  {
    key: "instagram-mentions",
    name: "Instagram · Professional mentions",
    homepage: "https://www.instagram.com/",
    feedUrl: "https://graph.instagram.com/",
    kind: "Instagram",
    channel: "Instagram",
    priority: 90,
  },
];

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  processEntities: true,
  trimValues: true,
});

const keywordRules = [
  { pattern: /\bjoint revenue board\b/i, weight: 12, topic: "JRB & NRS" },
  { pattern: /\bnigeria revenue service\b/i, weight: 12, topic: "JRB & NRS" },
  { pattern: /\bfederal inland revenue service\b/i, weight: 10, topic: "Revenue administration" },
  { pattern: /\b(?:jrb|jtb)\b/i, weight: 8, topic: "JRB & NRS" },
  { pattern: /\bnrs\b/i, weight: 8, topic: "JRB & NRS" },
  { pattern: /\bfirs\b/i, weight: 8, topic: "Revenue administration" },
  { pattern: /\btax reform(?:s)?\b/i, weight: 8, topic: "Tax reform" },
  { pattern: /\bnew tax (?:law|laws|act|acts)\b/i, weight: 8, topic: "Tax reform" },
  { pattern: /\bpersonal income tax\b|\bcorporate income tax\b/i, weight: 7, topic: "Tax policy" },
  { pattern: /\bwithholding tax\b|\bcapital gains tax\b|\bstamp dut(?:y|ies)\b/i, weight: 7, topic: "Tax policy" },
  { pattern: /\bvalue added tax\b|\bvat\b/i, weight: 6, topic: "Tax policy" },
  { pattern: /\btax identification\b|\btax id\b|\btin\b/i, weight: 6, topic: "Tax administration" },
  { pattern: /\btaxpayer(?:s)?\b|\btax administration\b/i, weight: 5, topic: "Tax administration" },
  { pattern: /\binternal revenue service\b|\brevenue board\b/i, weight: 5, topic: "Revenue administration" },
  { pattern: /\brevenue collection\b|\btax collection\b/i, weight: 5, topic: "Revenue administration" },
  { pattern: /\btax tribunal\b|\btax appeal\b|\btax compliance\b/i, weight: 5, topic: "Tax administration" },
  { pattern: /\bfiscal policy\b|\bfiscal reform(?:s)?\b/i, weight: 4, topic: "Fiscal policy" },
  { pattern: /\binternally generated revenue\b|\bigr\b/i, weight: 4, topic: "Revenue administration" },
  { pattern: /\btax(?:es|ation)?\b/i, weight: 3, topic: "Tax policy" },
  { pattern: /\brevenue\b/i, weight: 2, topic: "Revenue administration" },
] as const;

function stringValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return stringValue(record["#text"] ?? record.href ?? record["@_href"] ?? "");
  }

  return "";
}

function stripMarkup(value: unknown, limit = 420): string {
  const raw = stringValue(value);
  if (!raw) return "";

  const $ = load(`<div>${raw}</div>`);
  const text = $("div").first().text().replace(/\s+/g, " ").trim();

  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

function parseDate(value: unknown): Date | null {
  const raw = stringValue(value);
  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function canonicalUrl(value: string, base?: string): string {
  try {
    const url = new URL(value, base);
    url.hash = "";
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ].forEach((key) => url.searchParams.delete(key));
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString();
  } catch {
    return value.trim();
  }
}

function sourceDomain(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizeHeadline(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprintFor(article: CollectedArticle): string {
  const normalizedTitle = normalizeHeadline(article.headline);
  const identity =
    normalizedTitle.length >= 24
      ? normalizedTitle
      : canonicalUrl(article.url) || `${article.sourceKey}:${normalizedTitle}`;

  return createHash("sha256").update(identity).digest("hex");
}

function scoreArticle(article: CollectedArticle): ScoredArticle | null {
  const title = article.headline;
  const body = `${article.summary} ${article.author}`;
  const combinedText = `${title} ${body}`;
  const topicScores = new Map<string, number>();
  let score = article.sourceKey.endsWith("-official") ? 4 : 0;

  keywordRules.forEach((rule) => {
    let contribution = 0;
    if (rule.pattern.test(title)) contribution += rule.weight * 2;
    if (rule.pattern.test(body)) contribution += rule.weight;
    if (!contribution) return;

    score += contribution;
    topicScores.set(
      rule.topic,
      (topicScores.get(rule.topic) ?? 0) + contribution
    );
  });

  const looksLikeRoutineCorporateEarnings =
    /\b(?:pre-tax profit|profit before tax|after-tax profit|profit after tax|tax expense)\b/i.test(
      combinedText
    );

  if (looksLikeRoutineCorporateEarnings && score < 12) return null;
  if (score < 6) return null;

  const topic =
    [...topicScores.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "Revenue intelligence";

  return {
    ...article,
    fingerprint: fingerprintFor(article),
    relevance: score >= 18 ? "High" : score >= 10 ? "Medium" : "Low",
    topic,
    score,
  };
}

function asArray(value: unknown): Record<string, unknown>[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object"
  );
}

function extractLink(item: Record<string, unknown>, base: string): string {
  const rawLink = item.link;
  let link = "";

  if (Array.isArray(rawLink)) {
    const alternate =
      rawLink.find(
        (candidate) =>
          candidate &&
          typeof candidate === "object" &&
          (candidate as Record<string, unknown>)["@_rel"] === "alternate"
      ) ?? rawLink[0];
    link = stringValue(alternate);
  } else {
    link = stringValue(rawLink);
  }

  return canonicalUrl(link || stringValue(item.guid || item.id), base);
}

function parseRssFeed(
  xml: string,
  source: NewsSourceDefinition
): CollectedArticle[] {
  const parsed = xmlParser.parse(xml) as Record<string, unknown>;
  const rss = parsed.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  const feed = parsed.feed as Record<string, unknown> | undefined;
  const rawItems = channel?.item ?? feed?.entry ?? [];

  return asArray(rawItems)
    .slice(0, 100)
    .map((item) => {
      const headline = stripMarkup(item.title, 260);
      const url = extractLink(item, source.homepage);
      const summary = stripMarkup(
        item.description ?? item.summary ?? item.encoded ?? item.content
      )
        .replace(/\s+The post .+? appeared first on .+?\.?$/i, "")
        .replace(/\s+(?:Read more|Continue reading)\s*→?$/i, "")
        .trim();

      return {
        headline,
        source: source.name,
        sourceKey: source.key,
        sourceDomain: sourceDomain(url || source.homepage),
        channel: source.channel,
        contentType: "Article" as const,
        url,
        author: stripMarkup(item.creator ?? item.author, 120),
        summary,
        publishedAt: parseDate(
          item.pubDate ?? item.published ?? item.updated ?? item.date
        ),
      };
    })
    .filter((item) => item.headline && item.url);
}

function decodeJavaScriptString(value: string): string {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, " ");
  }
}

function extractArrayObjects(
  javascript: string,
  marker: string
): string[] {
  const markerIndex = javascript.indexOf(marker);
  if (markerIndex < 0) return [];

  const arrayStart = javascript.indexOf("[", markerIndex + marker.length);
  if (arrayStart < 0) return [];

  const objects: string[] = [];
  let arrayDepth = 1;
  let objectDepth = 0;
  let objectStart = -1;
  let quote = "";
  let escaped = false;

  for (let index = arrayStart + 1; index < javascript.length; index += 1) {
    const character = javascript[index] ?? "";

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\") {
        escaped = true;
        continue;
      }
      if (character === quote) quote = "";
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }

    if (character === "[") arrayDepth += 1;
    if (character === "]") {
      arrayDepth -= 1;
      if (arrayDepth === 0) break;
    }

    if (character === "{") {
      if (objectDepth === 0 && arrayDepth === 1) objectStart = index;
      objectDepth += 1;
    } else if (character === "}") {
      objectDepth -= 1;
      if (objectDepth === 0 && objectStart >= 0) {
        objects.push(javascript.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }

  return objects;
}

function objectStringField(objectSource: string, field: string): string {
  const pattern = new RegExp(
    `(?:^|,)${field}:"((?:\\\\.|[^"\\\\])*)"`
  );
  const value = objectSource.match(pattern)?.[1] ?? "";
  return decodeJavaScriptString(value);
}

function parseJrbBundle(
  javascript: string,
  source: NewsSourceDefinition
): CollectedArticle[] {
  const items: CollectedArticle[] = [];

  for (const objectSource of extractArrayObjects(javascript, "Mr=")) {
    const headline = objectStringField(objectSource, "title");
    const slug = objectStringField(objectSource, "slug");
    const category = objectStringField(objectSource, "category");
    if (!headline || !slug || category !== "news") continue;

    items.push({
      headline,
      source: source.name,
      sourceKey: source.key,
      sourceDomain: "jrb.gov.ng",
      channel: "Official",
      contentType: "Press release",
      url: `https://www.jrb.gov.ng/media-center/${slug}`,
      author: "Joint Revenue Board",
      summary: objectStringField(objectSource, "excerpt")
        .replace(/\s+/g, " ")
        .trim(),
      publishedAt: parseDate(objectStringField(objectSource, "date")),
    });
  }

  return items.slice(0, 40);
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (compatible; Morrow-News-Monitor/1.0; +https://localhost)",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Source returned HTTP ${response.status}.`);
  }

  return response.text();
}

async function collectXMentions(
  source: NewsSourceDefinition
): Promise<SourceResult> {
  const bearerToken = process.env.X_BEARER_TOKEN?.trim();

  if (!bearerToken) {
    return {
      source,
      status: "Connect required",
      items: [],
      error:
        "Add an X API bearer token during the hosted integration setup to enable recent public mention search.",
    };
  }

  const query = [
    '("Joint Revenue Board"',
    'OR "Nigeria Revenue Service"',
    'OR "tax reform"',
    'OR "tax administration"',
    'OR "revenue service"',
    "OR JRB",
    "OR NRS",
    "OR FIRS)",
    "lang:en",
    "-is:retweet",
  ].join(" ");
  const url = new URL(source.feedUrl);
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", "25");
  url.searchParams.set("sort_order", "recency");
  url.searchParams.set("tweet.fields", "created_at,author_id,lang");
  url.searchParams.set("expansions", "author_id");
  url.searchParams.set("user.fields", "name,username,verified");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "User-Agent": "Morrow-News-Monitor/1.0",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`X returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as {
    data?: Array<{
      id?: string;
      text?: string;
      author_id?: string;
      created_at?: string;
    }>;
    includes?: {
      users?: Array<{
        id?: string;
        name?: string;
        username?: string;
      }>;
    };
  };
  const users = new Map(
    (payload.includes?.users ?? []).map((user) => [user.id, user])
  );
  const items = (payload.data ?? [])
    .map((post): CollectedArticle | null => {
      const id = post.id?.trim();
      const text = post.text?.replace(/\s+/g, " ").trim();
      if (!id || !text) return null;

      const user = users.get(post.author_id);
      const username = user?.username?.trim() || "i";
      const author = user?.name
        ? `${user.name}${user.username ? ` (@${user.username})` : ""}`
        : user?.username
          ? `@${user.username}`
          : "X user";

      return {
        headline:
          text.length > 220 ? `${text.slice(0, 219).trimEnd()}…` : text,
        source: user?.username ? `X · @${user.username}` : "X",
        sourceKey: source.key,
        sourceDomain: "x.com",
        channel: "X",
        contentType: "Post",
        url:
          username === "i"
            ? `https://x.com/i/web/status/${id}`
            : `https://x.com/${username}/status/${id}`,
        author,
        summary: text.length > 420 ? `${text.slice(0, 419).trimEnd()}…` : text,
        publishedAt: parseDate(post.created_at),
      };
    })
    .filter((item): item is CollectedArticle => Boolean(item));

  return {
    source,
    status: items.length ? "Healthy" : "No matches",
    items,
    error: items.length ? "" : "No matching public X posts were returned.",
  };
}

async function collectInstagramMentions(
  source: NewsSourceDefinition
): Promise<SourceResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID?.trim();

  if (!accessToken || !accountId) {
    return {
      source,
      status: "Connect required",
      items: [],
      error:
        "Connect a professional Instagram account during hosted setup to monitor tagged media and account mentions.",
    };
  }

  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
  const url = new URL(
    `https://graph.facebook.com/${graphVersion}/${accountId}/tags`
  );
  url.searchParams.set(
    "fields",
    "id,caption,media_type,permalink,timestamp,username"
  );
  url.searchParams.set("limit", "50");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Morrow-News-Monitor/1.0",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Instagram returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as {
    data?: Array<{
      id?: string;
      caption?: string;
      permalink?: string;
      timestamp?: string;
      username?: string;
    }>;
  };
  const items = (payload.data ?? [])
    .map((post): CollectedArticle | null => {
      const caption = post.caption?.replace(/\s+/g, " ").trim();
      const permalink = post.permalink?.trim();
      if (!caption || !permalink) return null;

      return {
        headline:
          caption.length > 220
            ? `${caption.slice(0, 219).trimEnd()}…`
            : caption,
        source: post.username
          ? `Instagram · @${post.username}`
          : "Instagram",
        sourceKey: source.key,
        sourceDomain: "instagram.com",
        channel: "Instagram",
        contentType: "Post",
        url: permalink,
        author: post.username ? `@${post.username}` : "Instagram user",
        summary:
          caption.length > 420
            ? `${caption.slice(0, 419).trimEnd()}…`
            : caption,
        publishedAt: parseDate(post.timestamp),
      };
    })
    .filter((item): item is CollectedArticle => Boolean(item));

  return {
    source,
    status: items.length ? "Healthy" : "No matches",
    items,
    error: items.length
      ? ""
      : "No matching tagged Instagram media was returned.",
  };
}

async function collectSource(
  source: NewsSourceDefinition
): Promise<SourceResult> {
  try {
    if (source.kind === "X") {
      return await collectXMentions(source);
    }

    if (source.kind === "Instagram") {
      return await collectInstagramMentions(source);
    }

    if (source.kind === "Link") {
      return {
        source,
        status: "Link only",
        items: [],
        error:
          "The official page blocks server-side extraction; its verified source link remains on the watchlist.",
      };
    }

    if (source.kind === "Official") {
      const page = await fetchText(source.feedUrl);
      const scriptPath = page.match(
        /<script[^>]+src="(\/assets\/index-[^"]+\.js)"/i
      )?.[1];

      if (!scriptPath) {
        throw new Error("The official page bundle could not be located.");
      }

      const bundle = await fetchText(new URL(scriptPath, source.homepage).toString());
      const items = parseJrbBundle(bundle, source);

      return {
        source,
        status: "Healthy",
        items,
        error: "",
      };
    }

    const xml = await fetchText(source.feedUrl);
    return {
      source,
      status: "Healthy",
      items: parseRssFeed(xml, source),
      error: "",
    };
  } catch (error) {
    return {
      source,
      status: "Failed",
      items: [],
      error: error instanceof Error ? error.message : "Unknown source error.",
    };
  }
}

function isRecent(article: CollectedArticle): boolean {
  if (!article.publishedAt) return true;
  const oldestAllowed = Date.now() - 1000 * 60 * 60 * 24 * 35;
  return article.publishedAt.getTime() >= oldestAllowed;
}

export async function runNewsMonitor() {
  const startedAt = new Date();
  const run = await prisma.newsMonitorRun.create({
    data: {
      status: "Running",
      startedAt,
    },
  });

  await Promise.all(
    NEWS_SOURCES.map((source) =>
      prisma.newsSourceState.upsert({
        where: { key: source.key },
        update: {
          name: source.name,
          homepage: source.homepage,
          feedUrl: source.feedUrl,
          kind: source.kind,
          priority: source.priority,
        },
        create: {
          key: source.key,
          name: source.name,
          homepage: source.homepage,
          feedUrl: source.feedUrl,
          kind: source.kind,
          priority: source.priority,
        },
      })
    )
  );

  const results = await Promise.all(NEWS_SOURCES.map(collectSource));
  const now = new Date();

  await Promise.all(
    results.map((result) =>
      prisma.newsSourceState.update({
        where: { key: result.source.key },
        data: {
          lastCheckedAt: now,
          lastSuccessfulAt:
            result.status === "Failed" ||
            result.status === "Connect required"
              ? undefined
              : now,
          lastStatus: result.status,
          lastError: result.error,
          itemsSeen: result.items.length,
        },
      })
    )
  );

  const fetchedArticles = results.flatMap((result) => result.items);
  const scoredArticles = fetchedArticles
    .filter(isRecent)
    .map(scoreArticle)
    .filter((item): item is ScoredArticle => Boolean(item))
    .sort((left, right) => right.score - left.score);

  let createdCount = 0;
  let duplicateCount = 0;

  for (const article of scoredArticles) {
    const existing = await prisma.newsItem.findUnique({
      where: { fingerprint: article.fingerprint },
      select: { id: true },
    });

    if (existing) {
      await prisma.newsItem.update({
        where: { id: existing.id },
        data: {
          headline: article.headline,
          source: article.source,
          sourceKey: article.sourceKey,
          sourceDomain: article.sourceDomain,
          channel: article.channel,
          contentType: article.contentType,
          url: article.url,
          author: article.author,
          summary: article.summary,
          relevance: article.relevance,
          topic: article.topic,
          score: article.score,
          publishedAt: article.publishedAt,
          collectedAt: now,
        },
      });
      duplicateCount += 1;
      continue;
    }

    await prisma.newsItem.create({
      data: {
        headline: article.headline,
        source: article.source,
        sourceKey: article.sourceKey,
        sourceDomain: article.sourceDomain,
        channel: article.channel,
        contentType: article.contentType,
        url: article.url,
        fingerprint: article.fingerprint,
        author: article.author,
        summary: article.summary,
        relevance: article.relevance,
        topic: article.topic,
        score: article.score,
        status: "New",
        publishedAt: article.publishedAt,
        collectedAt: now,
      },
    });
    createdCount += 1;
  }

  const errors = results
    .filter((result) => result.status === "Failed")
    .map((result) => ({
      source: result.source.name,
      message: result.error,
    }));
  const completedAt = new Date();
  const sourcesSucceeded = results.filter(
    (result) =>
      result.status !== "Failed" && result.status !== "Connect required"
  ).length;

  const updatedRun = await prisma.newsMonitorRun.update({
    where: { id: run.id },
    data: {
      status:
        sourcesSucceeded === 0
          ? "Failed"
          : errors.length
            ? "Completed with warnings"
            : "Completed",
      completedAt,
      sourcesChecked: results.length,
      sourcesSucceeded,
      articlesFetched: fetchedArticles.length,
      articlesRelevant: scoredArticles.length,
      articlesCreated: createdCount,
      duplicatesSkipped: duplicateCount,
      errors: JSON.stringify(errors),
    },
  });

  return {
    run: updatedRun,
    sourceResults: results.map((result) => ({
      key: result.source.key,
      name: result.source.name,
      status: result.status,
      itemsSeen: result.items.length,
      error: result.error,
    })),
  };
}

export function buildNewsDigest(
  items: Array<{
    id: string;
    headline: string;
    source: string;
    channel: string;
    url: string;
    summary: string;
    relevance: string;
    topic: string;
    publishedAt: Date | null;
  }>,
  date = new Date()
) {
  const dateLabel = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
  const sourceCount = new Set(items.map((item) => item.source)).size;
  const highCount = items.filter((item) => item.relevance === "High").length;

  if (!items.length) {
    return [
      `DAILY REVENUE INTELLIGENCE — ${dateLabel.toUpperCase()}`,
      "",
      "NO RELEVANT NEW MENTIONS FOUND TODAY",
      "",
      "The connected newspaper, official, and social sources were checked. No new tax, revenue, JRB, NRS, FIRS, or related fiscal-policy development met the relevance threshold for today.",
      "",
      "No action is required. Monitoring continues.",
    ].join("\n");
  }

  return [
    `DAILY REVENUE INTELLIGENCE — ${dateLabel.toUpperCase()}`,
    "",
    `${items.length} relevant development${items.length === 1 ? "" : "s"} from ${sourceCount} source${sourceCount === 1 ? "" : "s"}. ${highCount} marked high priority.`,
    "",
    ...items.flatMap((item, index) => {
      const published = item.publishedAt
        ? new Intl.DateTimeFormat("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Africa/Lagos",
          }).format(item.publishedAt)
        : "Date not supplied";

      return [
        `${index + 1}. ${item.headline}`,
        `${item.channel} · ${item.source} · ${published} · ${item.topic}`,
        item.summary || "Open the original report for the full details.",
        `Read: ${item.url}`,
        "",
      ];
    }),
    "Prepared from original source links. Review facts and names before external circulation.",
  ].join("\n");
}

type CreateNewsDigestOptions = {
  itemIds?: string[];
  mode?: "manual" | "daily";
  reuseForDate?: boolean;
};

function lagosDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

export async function createNewsDigest({
  itemIds = [],
  mode = "manual",
  reuseForDate = false,
}: CreateNewsDigestOptions = {}) {
  const requestedIds = itemIds.filter((id) => typeof id === "string" && id);
  const now = new Date();
  const date = lagosDateKey(now);
  const startOfToday = new Date(`${date}T00:00:00+01:00`);
  const todayFilter = {
    status: {
      not: "Dismissed",
    },
    OR: [
      {
        publishedAt: {
          gte: startOfToday,
        },
      },
      {
        publishedAt: null,
        createdAt: {
          gte: startOfToday,
        },
      },
    ],
  } satisfies Prisma.NewsItemWhereInput;

  let items = await prisma.newsItem.findMany({
    where: requestedIds.length
      ? {
          id: {
            in: requestedIds,
          },
        }
      : mode === "daily"
        ? todayFilter
        : {
            status: "Shortlisted",
          },
    orderBy: [
      {
        score: "desc",
      },
      {
        publishedAt: "desc",
      },
    ],
    take: mode === "daily" ? 8 : 12,
  });

  if (!requestedIds.length && mode === "manual" && !items.length) {
    items = await prisma.newsItem.findMany({
      where: todayFilter,
      orderBy: [
        {
          score: "desc",
        },
        {
          publishedAt: "desc",
        },
      ],
      take: 8,
    });
  }

  const title = `Daily Revenue Intelligence · ${date}`;
  const data = {
    title,
    date,
    status: "Draft",
    content: buildNewsDigest(items, now),
    itemIds: JSON.stringify(items.map((item) => item.id)),
  };
  const existing = reuseForDate
    ? await prisma.newsDigest.findFirst({
        where: {
          title,
          date,
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    : null;
  const digest = existing
    ? await prisma.newsDigest.update({
        where: {
          id: existing.id,
        },
        data,
      })
    : await prisma.newsDigest.create({
        data,
      });

  if (items.length) {
    await prisma.newsItem.updateMany({
      where: {
        id: {
          in: items.map((item) => item.id),
        },
      },
      data: {
        status: "Included",
      },
    });
  }

  return {
    digest,
    itemCount: items.length,
    created: !existing,
    date,
  };
}
