import "server-only";

import { prisma } from "@/lib/prisma";

export type NewsBriefingTopic = {
  name: string;
  count: number;
  previousCount: number;
  delta: number;
  highPriority: number;
  averageScore: number;
  share: number;
};

export type NewsBriefingTimelinePoint = {
  date: string;
  label: string;
  count: number;
  highPriority: number;
};

export type NewsBriefingSourceMix = {
  channel: string;
  count: number;
  percentage: number;
};

export type NewsBriefingSignal = {
  id: string;
  headline: string;
  source: string;
  channel: string;
  topic: string;
  score: number;
  relevance: string;
  status: string;
  summary: string;
  url: string;
  publishedAt: string | null;
  why: string;
};

export type NewsExecutiveBriefing = {
  generatedAt: string;
  pressure: number;
  pressureLabel: "Quiet" | "Watch" | "Elevated" | "Critical";
  summary: string;
  methodology: string;
  metrics: {
    total: number;
    today: number;
    recent7: number;
    highPriority: number;
    waitingReview: number;
    sourceDiversity: number;
    officialSignals: number;
    healthySources: number;
    configuredSources: number;
  };
  lead: NewsBriefingSignal | null;
  attention: NewsBriefingSignal[];
  topics: NewsBriefingTopic[];
  timeline: NewsBriefingTimelinePoint[];
  sourceMix: NewsBriefingSourceMix[];
};

const dayMs = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function lagosDateKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(value);
}

function signalDate(item: { publishedAt: Date | null; createdAt: Date }) {
  return item.publishedAt ?? item.createdAt;
}

function explainSignal(item: {
  channel: string;
  topic: string;
  score: number;
  relevance: string;
}) {
  const provenance =
    item.channel === "Official"
      ? "It comes from an official institutional source"
      : `It is a ${item.relevance.toLowerCase()}-relevance ${item.channel.toLowerCase()} signal`;
  return `${provenance}, scores ${item.score} against the revenue watchlist, and leads the ${item.topic} cluster.`;
}

function toSignal(item: {
  id: string;
  headline: string;
  source: string;
  channel: string;
  topic: string;
  score: number;
  relevance: string;
  status: string;
  summary: string;
  url: string;
  publishedAt: Date | null;
}) : NewsBriefingSignal {
  return {
    id: item.id,
    headline: item.headline,
    source: item.source,
    channel: item.channel,
    topic: item.topic,
    score: item.score,
    relevance: item.relevance,
    status: item.status,
    summary: item.summary,
    url: item.url,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    why: explainSignal(item),
  };
}

function pressureLabel(pressure: number): NewsExecutiveBriefing["pressureLabel"] {
  if (pressure >= 78) return "Critical";
  if (pressure >= 55) return "Elevated";
  if (pressure >= 25) return "Watch";
  return "Quiet";
}

export async function buildNewsExecutiveBriefing(): Promise<NewsExecutiveBriefing> {
  const now = new Date();
  const todayKey = lagosDateKey(now);
  const today = startOfDay(now);
  const recentStart = new Date(today.getTime() - 6 * dayMs);
  const previousStart = new Date(today.getTime() - 13 * dayMs);

  const [items, sourceStates] = await Promise.all([
    prisma.newsItem.findMany({
      orderBy: [
        { score: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: 500,
    }),
    prisma.newsSourceState.findMany(),
  ]);

  const todayItems = items.filter(
    (item) => lagosDateKey(signalDate(item)) === todayKey
  );
  const recentItems = items.filter(
    (item) => signalDate(item).getTime() >= recentStart.getTime()
  );
  const previousItems = items.filter((item) => {
    const time = signalDate(item).getTime();
    return time >= previousStart.getTime() && time < recentStart.getTime();
  });
  const highPriority = items.filter(
    (item) => item.relevance === "High" || item.score >= 18
  );
  const waitingReview = items.filter(
    (item) => item.status === "New" || item.status === "Shortlisted"
  );

  const topicNames = new Set([
    ...recentItems.map((item) => item.topic || "General"),
    ...previousItems.map((item) => item.topic || "General"),
  ]);
  const topics = [...topicNames]
    .map((name) => {
      const current = recentItems.filter(
        (item) => (item.topic || "General") === name
      );
      const previous = previousItems.filter(
        (item) => (item.topic || "General") === name
      );
      return {
        name,
        count: current.length,
        previousCount: previous.length,
        delta: current.length - previous.length,
        highPriority: current.filter(
          (item) => item.relevance === "High" || item.score >= 18
        ).length,
        averageScore: current.length
          ? Math.round(
              current.reduce((total, item) => total + item.score, 0) /
                current.length
            )
          : 0,
        share: recentItems.length
          ? Math.round((current.length / recentItems.length) * 100)
          : 0,
      };
    })
    .sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count;
      return right.averageScore - left.averageScore;
    })
    .slice(0, 6);

  const timeline: NewsBriefingTimelinePoint[] = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(recentStart.getTime() + index * dayMs);
      const dateKey = lagosDateKey(date);
      const matches = recentItems.filter(
        (item) => lagosDateKey(signalDate(item)) === dateKey
      );
      return {
        date: dateKey,
        label: new Intl.DateTimeFormat("en-NG", {
          weekday: "short",
          timeZone: "Africa/Lagos",
        }).format(date),
        count: matches.length,
        highPriority: matches.filter(
          (item) => item.relevance === "High" || item.score >= 18
        ).length,
      };
    }
  );

  const sourceMix = [...new Set(recentItems.map((item) => item.channel))]
    .map((channel) => {
      const count = recentItems.filter((item) => item.channel === channel).length;
      return {
        channel,
        count,
        percentage: recentItems.length
          ? Math.round((count / recentItems.length) * 100)
          : 0,
      };
    })
    .sort((left, right) => right.count - left.count);

  const rankedAttention = waitingReview
    .filter((item) => signalDate(item).getTime() >= recentStart.getTime())
    .sort((left, right) => {
      const leftOfficial = left.channel === "Official" ? 5 : 0;
      const rightOfficial = right.channel === "Official" ? 5 : 0;
      return right.score + rightOfficial - (left.score + leftOfficial);
    })
    .slice(0, 5);
  const leadItem = rankedAttention[0] ?? recentItems[0] ?? items[0] ?? null;

  const highRecent = recentItems.filter(
    (item) => item.relevance === "High" || item.score >= 18
  ).length;
  const officialRecent = recentItems.filter(
    (item) => item.channel === "Official"
  ).length;
  const topicAcceleration = topics.reduce(
    (total, topic) => total + Math.max(0, topic.delta),
    0
  );
  const pressure = Math.min(
    100,
    Math.round(
      highRecent * 9 +
        recentItems.length * 1.4 +
        officialRecent * 5 +
        topicAcceleration * 2
    )
  );
  const label = pressureLabel(pressure);
  const leadingTopic = topics[0];
  const summary = recentItems.length
    ? `${recentItems.length} relevant signal${recentItems.length === 1 ? "" : "s"} were recorded in the last seven days. ${leadingTopic ? `${leadingTopic.name} leads coverage with ${leadingTopic.count}, ${leadingTopic.delta > 0 ? `up ${leadingTopic.delta}` : leadingTopic.delta < 0 ? `down ${Math.abs(leadingTopic.delta)}` : "flat"} against the previous week.` : "No single topic dominates the cycle."} ${highRecent ? `${highRecent} high-priority signal${highRecent === 1 ? " needs" : "s need"} review.` : "No high-priority signal is waiting."}`
    : "No relevant signal was recorded in the last seven days. The intelligence desk is quiet, not broken; source health remains visible below.";

  return {
    generatedAt: now.toISOString(),
    pressure,
    pressureLabel: label,
    summary,
    methodology:
      "Pressure is calculated from saved seven-day signal volume, watchlist scores, official-source activity, and topic acceleration. It measures news-cycle intensity, not truth or sentiment. No generative AI is used.",
    metrics: {
      total: items.length,
      today: todayItems.length,
      recent7: recentItems.length,
      highPriority: highPriority.length,
      waitingReview: waitingReview.length,
      sourceDiversity: new Set(items.map((item) => item.sourceDomain || item.source)).size,
      officialSignals: items.filter((item) => item.channel === "Official").length,
      healthySources: sourceStates.filter(
        (source) => source.lastStatus === "Healthy"
      ).length,
      configuredSources: sourceStates.length,
    },
    lead: leadItem ? toSignal(leadItem) : null,
    attention: rankedAttention.map(toSignal),
    topics,
    timeline,
    sourceMix,
  };
}
