"use client";

import type { ElementType } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  BarChart3,
  Bookmark,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Copy,
  ExternalLink,
  FileText,
  Flame,
  Globe2,
  Inbox,
  Landmark,
  Layers3,
  LoaderCircle,
  Newspaper,
  Radar,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useDevonPreferences } from "@/components/providers/devon-preferences-provider";
import type {
  NewsBriefingTopic,
  NewsExecutiveBriefing,
} from "@/lib/news-briefing";

type NewsStatus = "New" | "Shortlisted" | "Included" | "Dismissed";
type NewsChannel =
  | "Newspaper"
  | "Broadcaster"
  | "Official"
  | "X"
  | "Instagram"
  | "Manual";
type DateFilter = "Today" | "7 days" | "All time";
type SortMode = "Priority" | "Newest";

type NewsItem = {
  id: string;
  headline: string;
  source: string;
  sourceKey: string;
  sourceDomain: string;
  channel: NewsChannel;
  contentType: "Article" | "Press release" | "Post" | "Manual signal";
  url: string;
  author: string;
  summary: string;
  relevance: "High" | "Medium" | "Low";
  topic: string;
  score: number;
  status: NewsStatus;
  notes: string;
  publishedAt: string | null;
  collectedAt: string;
  createdAt: string;
  updatedAt: string;
};

type NewsSource = {
  key: string;
  name: string;
  homepage: string;
  feedUrl: string;
  kind: "RSS" | "Official" | "Link" | "X" | "Instagram";
  channel: Exclude<NewsChannel, "Manual">;
  enabled: boolean;
  lastCheckedAt: string | null;
  lastSuccessfulAt: string | null;
  lastStatus:
    | "Ready"
    | "Healthy"
    | "Link only"
    | "Connect required"
    | "No matches"
    | "Failed";
  lastError: string;
  itemsSeen: number;
};

type MonitorRun = {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  sourcesChecked: number;
  sourcesSucceeded: number;
  articlesFetched: number;
  articlesRelevant: number;
  articlesCreated: number;
  duplicatesSkipped: number;
  errors: string;
};

type NewsDigest = {
  id: string;
  title: string;
  date: string;
  status: string;
  content: string;
  itemIds: string;
  createdAt: string;
  updatedAt: string;
};

type Notice = { tone: "success" | "error"; text: string };

const dateFilters: DateFilter[] = ["Today", "7 days", "All time"];
const statusFilters: Array<"All" | NewsStatus> = [
  "All",
  "New",
  "Shortlisted",
  "Included",
  "Dismissed",
];
const channelFilters: Array<"All" | NewsChannel> = [
  "All",
  "Newspaper",
  "Broadcaster",
  "Official",
  "X",
  "Instagram",
  "Manual",
];

function lagosDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function relativeTime(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function publishedDate(value: string | null) {
  if (!value) return "Date not supplied";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not supplied";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function channelLabel(channel: NewsChannel) {
  if (channel === "Broadcaster") return "TV / broadcaster";
  if (channel === "Official") return "Official source";
  if (channel === "X") return "X post";
  if (channel === "Instagram") return "Instagram post";
  if (channel === "Manual") return "Manual signal";
  return "Newspaper";
}

function channelStyle(channel: NewsChannel) {
  if (channel === "Official") return "bg-emerald-50 text-emerald-700";
  if (channel === "Broadcaster") return "bg-sky-50 text-sky-700";
  if (channel === "X") return "bg-[#17171b] text-white";
  if (channel === "Instagram") {
    return "bg-gradient-to-r from-fuchsia-50 to-orange-50 text-fuchsia-700";
  }
  if (channel === "Manual") return "bg-amber-50 text-amber-700";
  return "bg-indigo-50 text-indigo-700";
}

function statusStyle(status: NewsStatus) {
  if (status === "Shortlisted") return "bg-amber-50 text-amber-700";
  if (status === "Included") return "bg-emerald-50 text-emerald-700";
  if (status === "Dismissed") return "bg-slate-100 text-slate-500";
  return "bg-blue-50 text-blue-700";
}

function sourceStatusColor(status: NewsSource["lastStatus"]) {
  if (status === "Healthy") return "bg-emerald-400";
  if (status === "No matches") return "bg-sky-400";
  if (status === "Link only") return "bg-amber-400";
  if (status === "Connect required") return "bg-violet-400";
  if (status === "Failed") return "bg-rose-500";
  return "bg-slate-300";
}

function provenance(channel: NewsChannel) {
  if (channel === "Official") {
    return { label: "Primary source", note: "Published by the institution itself." };
  }
  if (channel === "Newspaper" || channel === "Broadcaster") {
    return { label: "Established media", note: "Traceable reporting with an original link." };
  }
  if (channel === "X" || channel === "Instagram") {
    return { label: "Public social source", note: "Account and permalink preserved for verification." };
  }
  return { label: "Manual record", note: "Entered by a Morrow workspace operator." };
}

function SignalIcon({ channel, size = 10 }: { channel: NewsChannel; size?: number }) {
  if (channel === "Official") return <Landmark size={size} />;
  if (channel === "X") return <AtSign size={size} />;
  if (channel === "Instagram") return <Camera size={size} />;
  if (channel === "Broadcaster") return <Radar size={size} />;
  return <Newspaper size={size} />;
}

export function NewsIntelligenceClient() {
  const { playSound } = useDevonPreferences();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [runs, setRuns] = useState<MonitorRun[]>([]);
  const [digests, setDigests] = useState<NewsDigest[]>([]);
  const [briefing, setBriefing] = useState<NewsExecutiveBriefing | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("7 days");
  const [statusFilter, setStatusFilter] = useState<"All" | NewsStatus>("All");
  const [channelFilter, setChannelFilter] = useState<"All" | NewsChannel>("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>("Priority");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeItemId, setActiveItemId] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [viewNow] = useState(() => new Date());

  const loadData = useCallback(async () => {
    try {
      const [newsResponse, monitorResponse, digestResponse, briefingResponse] =
        await Promise.all([
          fetch("/api/news", { cache: "no-store" }),
          fetch("/api/news/monitor", { cache: "no-store" }),
          fetch("/api/news/digests", { cache: "no-store" }),
          fetch("/api/news/briefing", { cache: "no-store" }),
        ]);

      if (
        !newsResponse.ok ||
        !monitorResponse.ok ||
        !digestResponse.ok ||
        !briefingResponse.ok
      ) {
        throw new Error("One or more intelligence services did not respond.");
      }

      const [newsData, monitorData, digestData, briefingData] = (await Promise.all([
        newsResponse.json(),
        monitorResponse.json(),
        digestResponse.json(),
        briefingResponse.json(),
      ])) as [
        { ok: boolean; newsItems?: NewsItem[] },
        { ok: boolean; sources?: NewsSource[]; runs?: MonitorRun[] },
        { ok: boolean; digests?: NewsDigest[] },
        { ok: boolean; briefing?: NewsExecutiveBriefing },
      ];

      if (!newsData.ok || !monitorData.ok || !digestData.ok || !briefingData.ok) {
        throw new Error("The intelligence response was incomplete.");
      }

      const nextItems = newsData.newsItems ?? [];
      setItems(nextItems);
      setSources(monitorData.sources ?? []);
      setRuns(monitorData.runs ?? []);
      setDigests(digestData.digests ?? []);
      setBriefing(briefingData.briefing ?? null);
      setActiveItemId((current) =>
        nextItems.some((item) => item.id === current)
          ? current
          : briefingData.briefing?.lead?.id ?? nextItems[0]?.id ?? ""
      );
    } catch (error) {
      console.error("Failed to load News Intelligence:", error);
      setNotice({
        tone: "error",
        text: "News Intelligence could not load its complete command picture.",
      });
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const todayKey = lagosDateKey(viewNow);
    const sevenDaysAgo = viewNow.getTime() - 7 * 24 * 60 * 60 * 1000;

    return items
      .filter((item) => {
        const itemDate = item.publishedAt ?? item.createdAt;
        const matchesDate =
          dateFilter === "All time" ||
          (dateFilter === "Today"
            ? lagosDateKey(itemDate) === todayKey
            : new Date(itemDate).getTime() >= sevenDaysAgo);
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        const matchesChannel =
          channelFilter === "All" || item.channel === channelFilter;
        const matchesTopic = topicFilter === "All" || item.topic === topicFilter;
        const matchesQuery =
          !normalizedQuery ||
          [item.headline, item.source, item.summary, item.topic, item.author]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        return (
          matchesDate &&
          matchesStatus &&
          matchesChannel &&
          matchesTopic &&
          matchesQuery
        );
      })
      .sort((left, right) => {
        if (sortMode === "Priority") {
          if (right.score !== left.score) return right.score - left.score;
        }
        const leftDate = new Date(left.publishedAt ?? left.createdAt).getTime();
        const rightDate = new Date(right.publishedAt ?? right.createdAt).getTime();
        return rightDate - leftDate;
      });
  }, [
    channelFilter,
    dateFilter,
    items,
    query,
    sortMode,
    statusFilter,
    topicFilter,
    viewNow,
  ]);

  const activeItem =
    items.find((item) => item.id === activeItemId) ?? filteredItems[0] ?? null;
  const latestRun = runs[0] ?? null;
  const latestDigest = digests[0] ?? null;
  const shortlistedCount = items.filter((item) => item.status === "Shortlisted").length;
  const connectedSources = sources.filter((source) => source.lastStatus === "Healthy").length;
  const pendingConnections = sources.filter(
    (source) => source.lastStatus === "Connect required"
  ).length;

  async function runMonitor() {
    try {
      setScanning(true);
      setNotice(null);
      const response = await fetch("/api/news/monitor", { method: "POST" });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        run?: MonitorRun;
      };
      if (!response.ok || !data.ok || !data.run) {
        throw new Error(data.message || "The monitoring run failed.");
      }
      await loadData();
      playSound();
      setNotice({
        tone: "success",
        text: data.run.articlesCreated
          ? `${data.run.articlesCreated} new relevant signal${data.run.articlesCreated === 1 ? "" : "s"} collected.`
          : data.run.articlesRelevant
            ? `${data.run.duplicatesSkipped} known signal${data.run.duplicatesSkipped === 1 ? "" : "s"} safely deduplicated.`
            : "The scan is complete. No relevant new mention was found.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "The monitor could not run.",
      });
    } finally {
      setScanning(false);
    }
  }

  async function updateStatus(item: NewsItem, status: NewsStatus) {
    const previous = item.status;
    setItems((current) =>
      current.map((candidate) =>
        candidate.id === item.id ? { ...candidate, status } : candidate
      )
    );
    try {
      const response = await fetch(`/api/news/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Signal status could not be updated.");
      setNotice({
        tone: "success",
        text:
          status === "Shortlisted"
            ? "Signal moved into the executive brief queue."
            : status === "Dismissed"
              ? "Signal dismissed without losing its source record."
              : "Signal status updated.",
      });
    } catch (error) {
      console.error("Failed to update signal:", error);
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? { ...candidate, status: previous } : candidate
        )
      );
      setNotice({ tone: "error", text: "That signal could not be updated." });
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : [...current, id]
    );
  }

  async function generateDigest() {
    try {
      setGenerating(true);
      const response = await fetch("/api/news/digests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: selectedIds }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        digest?: NewsDigest;
        message?: string;
      };
      if (!response.ok || !data.ok || !data.digest) {
        throw new Error(data.message || "The brief could not be created.");
      }
      const includedIds = JSON.parse(data.digest.itemIds) as string[];
      setDigests((current) => [data.digest!, ...current]);
      setItems((current) =>
        current.map((item) =>
          includedIds.includes(item.id) ? { ...item, status: "Included" } : item
        )
      );
      setSelectedIds([]);
      playSound();
      setNotice({
        tone: "success",
        text: includedIds.length
          ? "A clean, source-linked executive brief is ready."
          : "A transparent no-news brief is ready.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "The brief could not be created.",
      });
    } finally {
      setGenerating(false);
    }
  }

  async function copyDigest() {
    if (!latestDigest) return;
    await navigator.clipboard.writeText(latestDigest.content);
    setCopied(true);
    playSound();
    window.setTimeout(() => setCopied(false), 1800);
  }

  function focusSignal(id: string) {
    setActiveItemId(id);
    document.getElementById("signal-inbox")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (!loaded) return <NewsLoading />;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-[#08090d] text-white shadow-[0_42px_130px_rgba(10,11,18,0.22)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(108,86,255,0.34),transparent_30%),radial-gradient(circle_at_12%_100%,rgba(232,190,80,0.15),transparent_33%)]" />
        <div className="pointer-events-none absolute -right-28 -top-52 h-[38rem] w-[38rem] rounded-full border border-white/[0.055]" />
        <div className="pointer-events-none absolute -right-4 -top-36 h-[29rem] w-[29rem] rounded-full border border-white/[0.055]" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:p-10">
          <div className="flex min-w-0 flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                  <Radar size={13} className={scanning ? "animate-pulse" : "text-[#B8AEFF]"} />
                  {scanning ? "Scanning the public record" : "Intelligence room · live"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] px-3.5 py-2 text-[10px] font-bold text-emerald-200">
                  <ShieldCheck size={13} />
                  Source preserved
                </span>
              </div>

              <h2 className="mt-8 max-w-4xl text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[0.91] tracking-[-0.072em]">
                See the signal.
                <span className="block text-white/34">Leave the noise.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/54 sm:text-base">
                {briefing?.summary ??
                  "Morrow is assembling the shape of the current tax and revenue news cycle."}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void runMonitor()}
                disabled={scanning}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#111218] shadow-[0_18px_45px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
              >
                {scanning ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <RefreshCcw size={16} />
                )}
                {scanning ? "Reading sources…" : "Refresh intelligence"}
              </button>
              <button
                type="button"
                onClick={() => void generateDigest()}
                disabled={generating}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.065] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.11] disabled:opacity-60"
              >
                {generating ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <FileText size={16} />
                )}
                {selectedIds.length ? `Build brief · ${selectedIds.length}` : "Build executive brief"}
              </button>
            </div>
          </div>

          <div className="min-w-0 rounded-[2.2rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-2xl sm:p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/38">
                  Signal pressure
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {briefing?.pressureLabel ?? "Reading"}
                </p>
                <p className="mt-1 text-xs text-white/38">News-cycle intensity</p>
              </div>
              <PressureRing score={briefing?.pressure ?? 0} />
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4C9FF]">
                <Flame size={12} />
                Lead signal
              </div>
              {briefing?.lead ? (
                <button
                  type="button"
                  onClick={() => focusSignal(briefing.lead!.id)}
                  className="group mt-3 w-full text-left"
                >
                  <p className="text-lg font-semibold leading-6 tracking-[-0.025em] text-white">
                    {briefing.lead.headline}
                  </p>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/42">
                    {briefing.lead.why}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/68">
                    Open intelligence lens
                    <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                  </span>
                </button>
              ) : (
                <p className="mt-3 text-sm leading-6 text-white/42">
                  No lead signal is visible. Run the monitor when you are ready.
                </p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/15 py-4 text-center">
              <HeroStat label="7 days" value={briefing?.metrics.recent7 ?? 0} />
              <HeroStat label="Review" value={briefing?.metrics.waitingReview ?? 0} />
              <HeroStat label="Sources" value={briefing?.metrics.sourceDiversity ?? 0} />
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <div
          className={`flex items-center justify-between gap-4 rounded-[1.35rem] border px-4 py-3 text-sm ${
            notice.tone === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.tone === "error" ? <CircleAlert size={15} /> : <CheckCircle2 size={15} />}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded-full p-1 opacity-60 hover:bg-black/5 hover:opacity-100"
            aria-label="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Zap}
          label="High-priority"
          value={briefing?.metrics.highPriority ?? 0}
          note="Strong watchlist matches"
          accent="violet"
        />
        <MetricCard
          icon={Inbox}
          label="Waiting review"
          value={briefing?.metrics.waitingReview ?? 0}
          note="New or shortlisted signals"
          accent="gold"
        />
        <MetricCard
          icon={Globe2}
          label="Source diversity"
          value={briefing?.metrics.sourceDiversity ?? 0}
          note="Distinct publishers preserved"
          accent="blue"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Healthy monitors"
          value={connectedSources}
          note={`${sources.length || 17} configured · ${pendingConnections} to connect`}
          accent="green"
        />
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="devon-surface min-w-0 overflow-hidden p-6 sm:p-7">
          <SectionTitle
            icon={BarChart3}
            eyebrow="Seven-day rhythm"
            title="The shape of the news cycle."
            detail="Volume shows how loud the cycle is. Gold marks the highest-priority signals within it."
          />
          <SignalTimeline briefing={briefing} />
          <SourceComposition briefing={briefing} />
        </div>

        <div className="devon-surface min-w-0 p-6 sm:p-7">
          <SectionTitle
            icon={Layers3}
            eyebrow="Topic movement"
            title="What is gaining ground."
            detail="Current seven-day clusters compared with the seven days before them."
          />
          <div className="space-y-3">
            {(briefing?.topics ?? []).length ? (
              briefing!.topics.map((topic) => (
                <TopicRow
                  key={topic.name}
                  topic={topic}
                  active={topicFilter === topic.name}
                  onClick={() =>
                    setTopicFilter((current) =>
                      current === topic.name ? "All" : topic.name
                    )
                  }
                />
              ))
            ) : (
              <QuietState text="Topic movement will appear after relevant signals are collected." />
            )}
          </div>
        </div>
      </section>

      <section id="signal-inbox" className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1.22fr)_minmax(350px,0.78fr)]">
        <div className="devon-surface min-w-0 overflow-hidden">
          <div className="border-b border-black/[0.055] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A69F4]">
                  Intelligence inbox
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#202025]">
                  Read less. Understand more.
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#85858e]">
                  {filteredItems.length} signal{filteredItems.length === 1 ? "" : "s"} in this lens. Every source remains one click away.
                </p>
              </div>
              <div className="relative w-full lg:w-[300px]">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1a8]"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search headlines, sources, topics"
                  className="min-h-11 w-full rounded-[14px] border border-black/[0.07] bg-white/80 pl-10 pr-4 text-sm text-[#2d2d32] outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <FilterRail
                values={dateFilters}
                active={dateFilter}
                onChange={(value) => setDateFilter(value as DateFilter)}
                activeClass="bg-[#17171b] text-white"
              />
              <FilterRail
                values={channelFilters}
                active={channelFilter}
                onChange={(value) => setChannelFilter(value as "All" | NewsChannel)}
                activeClass="bg-[#6D5DFC] text-white"
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {statusFilters.map((status) => (
                  <FilterPill
                    key={status}
                    label={status}
                    active={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                    count={
                      status === "All"
                        ? undefined
                        : items.filter((item) => item.status === status).length
                    }
                  />
                ))}
                {topicFilter !== "All" ? (
                  <button
                    type="button"
                    onClick={() => setTopicFilter("All")}
                    className="shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700"
                  >
                    {topicFilter} ×
                  </button>
                ) : null}
                <div className="ml-auto flex shrink-0 rounded-full border border-black/[0.06] bg-white/60 p-1">
                  {(["Priority", "Newest"] as SortMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSortMode(mode)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                        sortMode === mode
                          ? "bg-white text-[#2b2b31] shadow-sm"
                          : "text-[#9a9aa2]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="devon-scrollbar max-h-[1100px] overflow-y-auto p-3 sm:p-4">
            {filteredItems.length ? (
              <div className="space-y-2.5">
                {filteredItems.map((item, index) => (
                  <SignalCard
                    key={item.id}
                    item={item}
                    index={index}
                    active={activeItem?.id === item.id}
                    selected={selectedIds.includes(item.id)}
                    onFocus={() => setActiveItemId(item.id)}
                    onToggle={() => toggleSelected(item.id)}
                    onStatus={(status) => void updateStatus(item, status)}
                  />
                ))}
              </div>
            ) : (
              <QuietState
                icon={Inbox}
                text={
                  items.length
                    ? "No signal matches this lens. Clear a filter to widen the view."
                    : "The intelligence desk is clear. Run the monitor to collect the first source-linked signal."
                }
                action={
                  items.length ? (
                    <button
                      type="button"
                      className="devon-secondary-button"
                      onClick={() => {
                        setQuery("");
                        setDateFilter("All time");
                        setStatusFilter("All");
                        setChannelFilter("All");
                        setTopicFilter("All");
                      }}
                    >
                      Reset intelligence lens
                    </button>
                  ) : undefined
                }
              />
            )}
          </div>
        </div>

        <aside className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start">
          <FocusedSignal
            item={activeItem}
            onStatus={(status) => activeItem && void updateStatus(activeItem, status)}
          />

          <section className="devon-surface overflow-hidden">
            <div className="border-b border-black/[0.055] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A69F4]">
                    Executive brief
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#25252a]">
                    Source-linked. Ready to carry.
                  </h3>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#f1f0ff] text-[#6d5dfc]">
                  <FileText size={17} />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void generateDigest()}
                  disabled={generating}
                  className="devon-primary-button"
                >
                  {generating ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {selectedIds.length ? `Brief ${selectedIds.length}` : "Build brief"}
                </button>
                <button
                  type="button"
                  onClick={() => void copyDigest()}
                  disabled={!latestDigest}
                  className="devon-secondary-button disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-[#97979f]">
                {selectedIds.length
                  ? `${selectedIds.length} checked signal${selectedIds.length === 1 ? "" : "s"} will be used.`
                  : shortlistedCount
                    ? `${shortlistedCount} shortlisted signal${shortlistedCount === 1 ? "" : "s"} will be used.`
                    : "Morrow will use today’s strongest matching signals and retain every source link."}
              </p>
            </div>
            <div className="p-4">
              {latestDigest ? (
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <span className="truncate text-[11px] font-semibold text-[#66666f]">
                      {latestDigest.title}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      {latestDigest.status}
                    </span>
                  </div>
                  <pre className="devon-scrollbar max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[17px] border border-black/[0.055] bg-[#f7f7f9] p-4 font-sans text-[12px] leading-6 text-[#57575f]">
                    {latestDigest.content}
                  </pre>
                </div>
              ) : (
                <QuietState text="Shortlist signals or let Morrow use today’s strongest source-linked matches." />
              )}
            </div>
          </section>

          <details className="devon-surface group overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a9aa2]">
                  Source integrity
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#2a2a2f]">
                  {connectedSources} healthy · {sources.length || 17} configured
                </h3>
              </div>
              <ChevronRight size={16} className="text-[#a1a1a8] transition group-open:rotate-90" />
            </summary>
            <div className="border-t border-black/[0.055] p-3">
              <div className="space-y-1">
                {sources.map((source) => (
                  <a
                    key={source.key}
                    href={source.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-[13px] px-3 py-2.5 transition hover:bg-black/[0.035]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${sourceStatusColor(source.lastStatus)}`} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#404046]">{source.name}</p>
                        <p className="mt-0.5 text-[10px] text-[#a0a0a8]">
                          {source.lastStatus}
                          {source.lastCheckedAt ? ` · ${relativeTime(source.lastCheckedAt)}` : ""}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={12} className="shrink-0 text-[#b0b0b7]" />
                  </a>
                ))}
              </div>
            </div>
          </details>

          <div className="rounded-[1.5rem] border border-black/[0.055] bg-white/60 px-4 py-3 text-[10px] leading-5 text-[#8d8d96]">
            <ShieldCheck size={12} className="mr-1.5 inline text-emerald-600" />
            {briefing?.methodology ?? "All intelligence remains tied to saved source records."}
            {latestRun ? ` Last monitor completed ${relativeTime(latestRun.completedAt)}.` : ""}
          </div>
        </aside>
      </section>
    </div>
  );
}

function PressureRing({ score }: { score: number }) {
  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="-rotate-90" viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="7" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="url(#news-pressure)"
          strokeLinecap="round"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="news-pressure" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="58%" stopColor="#A99DFF" />
            <stop offset="100%" stopColor="#E7C56B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tracking-[-0.05em]">
        {score}
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-semibold tracking-[-0.04em] text-white">{value}</p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">{label}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  accent,
}: {
  icon: ElementType;
  label: string;
  value: number;
  note: string;
  accent: "violet" | "gold" | "blue" | "green";
}) {
  const accents = {
    violet: "bg-violet-50 text-violet-700",
    gold: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="devon-surface p-5 transition hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${accents[accent]}`}>
          <Icon size={17} />
        </span>
        <span className="text-3xl font-semibold tracking-[-0.055em] text-[#202025]">{value}</span>
      </div>
      <p className="mt-5 text-xs font-semibold text-[#56565e]">{label}</p>
      <p className="mt-1 text-[11px] text-[#a0a0a8]">{note}</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  detail,
}: {
  icon: ElementType;
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#F0EEFF] text-[#6D5DFC]">
          <Icon size={17} />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A69F4]">{eyebrow}</p>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#202025]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#85858e]">{detail}</p>
    </div>
  );
}

function SignalTimeline({ briefing }: { briefing: NewsExecutiveBriefing | null }) {
  const timeline = briefing?.timeline ?? [];
  const max = Math.max(1, ...timeline.map((point) => point.count));
  return (
    <div>
      <div className="flex h-52 items-end gap-2 rounded-[1.65rem] border border-black/[0.055] bg-[linear-gradient(180deg,rgba(247,246,255,0.72),rgba(255,255,255,0.72))] px-4 pb-4 pt-7 sm:gap-3 sm:px-6">
        {timeline.map((point) => (
          <div key={point.date} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="flex h-full items-end justify-center">
              <div
                className="relative w-full max-w-12 overflow-hidden rounded-t-[12px] bg-gradient-to-t from-[#6553E7] to-[#B8AEFF] shadow-[0_10px_25px_rgba(109,93,252,0.18)] transition-[height] duration-700"
                style={{ height: `${Math.max(7, (point.count / max) * 100)}%` }}
              >
                {point.highPriority > 0 ? (
                  <div
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#D7A93C] to-[#F2D789]"
                    style={{ height: `${Math.max(12, (point.highPriority / Math.max(point.count, 1)) * 100)}%` }}
                  />
                ) : null}
              </div>
            </div>
            <div className="pt-3 text-center">
              <p className="text-[10px] font-semibold text-[#777780]">{point.label}</p>
              <p className="mt-0.5 text-[9px] text-[#b0b0b7]">{point.count}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-[#96969e]">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#7A69F4]" />Relevant volume</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E2BE61]" />High priority</span>
      </div>
    </div>
  );
}

function SourceComposition({ briefing }: { briefing: NewsExecutiveBriefing | null }) {
  const sourceMix = briefing?.sourceMix ?? [];

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1.05fr)_minmax(190px,0.95fr)]">
      <div className="rounded-[1.45rem] border border-black/[0.055] bg-white/58 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9a9aa3]">
              Source composition
            </p>
            <p className="mt-1 text-sm font-semibold text-[#333339]">
              Where this cycle comes from
            </p>
          </div>
          <Globe2 size={16} className="text-[#7A69F4]" />
        </div>
        <div className="mt-4 space-y-3">
          {sourceMix.length ? (
            sourceMix.slice(0, 3).map((source) => (
              <div key={source.channel}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#66666f]">{channelLabel(source.channel as NewsChannel)}</span>
                  <span className="text-[#9b9ba3]">{source.count} · {source.percentage}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/[0.055]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#6757EC,#B9AEFF)]"
                    style={{ width: `${Math.max(3, source.percentage)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs leading-5 text-[#9999a1]">Composition appears as signals arrive.</p>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.45rem] bg-[#17171d] p-4 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/42">
            <ShieldCheck size={13} className="text-emerald-300" />
            Defendable by design
          </div>
          <p className="mt-3 text-sm font-semibold leading-5 tracking-[-0.02em]">
            Every conclusion keeps its evidence attached.
          </p>
          <p className="mt-2 text-[10px] leading-5 text-white/42">
            Deterministic scoring, visible rules, original links—never invented context.
          </p>
        </div>
      </div>
    </div>
  );
}

function TopicRow({
  topic,
  active,
  onClick,
}: {
  topic: NewsBriefingTopic;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
        active
          ? "border-violet-200 bg-violet-50/75 shadow-[0_12px_35px_rgba(109,93,252,0.09)]"
          : "border-black/[0.055] bg-white/58 hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#303036]">{topic.name}</p>
          <p className="mt-1 text-[10px] text-[#9a9aa2]">{topic.share}% of seven-day coverage · avg score {topic.averageScore}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            topic.delta > 0
              ? "bg-rose-50 text-rose-700"
              : topic.delta < 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {topic.delta > 0 ? <TrendingUp size={11} /> : topic.delta < 0 ? <TrendingDown size={11} /> : null}
          {topic.delta > 0 ? `+${topic.delta}` : topic.delta}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.055]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6D5DFC] to-[#B1A7FF]"
          style={{ width: `${Math.max(5, topic.share)}%` }}
        />
      </div>
    </button>
  );
}

function FilterRail({
  values,
  active,
  onChange,
  activeClass,
}: {
  values: readonly string[];
  active: string;
  onChange: (value: string) => void;
  activeClass: string;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
            active === value
              ? activeClass
              : "border border-black/[0.055] bg-white/60 text-[#8d8d96] hover:bg-white hover:text-[#34343a]"
          }`}
        >
          {value === "Broadcaster" ? "TV / broadcaster" : value}
        </button>
      ))}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-black/[0.075] text-[#34343a] shadow-sm"
          : "border border-black/[0.055] bg-white/60 text-[#8d8d96] hover:bg-white"
      }`}
    >
      {label}
      {count !== undefined ? <span className="ml-1.5 opacity-50">{count}</span> : null}
    </button>
  );
}

function SignalCard({
  item,
  index,
  active,
  selected,
  onFocus,
  onToggle,
  onStatus,
}: {
  item: NewsItem;
  index: number;
  active: boolean;
  selected: boolean;
  onFocus: () => void;
  onToggle: () => void;
  onStatus: (status: NewsStatus) => void;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.55rem] border transition ${
        active
          ? "border-violet-300 bg-[linear-gradient(135deg,rgba(247,245,255,0.96),rgba(255,255,255,0.88))] shadow-[0_18px_50px_rgba(109,93,252,0.1)]"
          : "border-black/[0.055] bg-white/62 hover:border-black/[0.1] hover:bg-white"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${
          item.score >= 18 ? "bg-rose-400" : item.score >= 10 ? "bg-violet-400" : "bg-slate-300"
        }`}
      />
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <button
            type="button"
            onClick={onToggle}
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border transition ${
              selected
                ? "border-[#6D5DFC] bg-[#6D5DFC] text-white"
                : "border-black/[0.12] bg-white text-transparent hover:border-[#6D5DFC]"
            }`}
            aria-label={selected ? "Remove from brief selection" : "Select for brief"}
          >
            <Check size={13} strokeWidth={3} />
          </button>

          <button type="button" onClick={onFocus} className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${channelStyle(item.channel)}`}>
                <SignalIcon channel={item.channel} />
                {channelLabel(item.channel)}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(item.status)}`}>
                {item.status}
              </span>
              <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-semibold text-[#777780]">
                {item.topic}
              </span>
            </div>
            <h4 className="mt-3 text-[16px] font-semibold leading-6 tracking-[-0.027em] text-[#25252a] sm:text-[17px]">
              {item.headline}
            </h4>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#7f7f88]">{item.summary || "No publisher summary was supplied."}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium text-[#9b9ba3]">
              <span className="font-semibold text-[#62626a]">{item.source || "Unknown source"}</span>
              <span>·</span>
              <span>{publishedDate(item.publishedAt)}</span>
              <span>·</span>
              <span>signal {String(index + 1).padStart(2, "0")}</span>
            </div>
          </button>

          <div className="shrink-0 text-right">
            <p className={`text-2xl font-semibold tracking-[-0.055em] ${item.score >= 18 ? "text-rose-600" : "text-[#4f46c7]"}`}>{item.score}</p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#b0b0b7]">Score</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 pl-9">
          <button
            type="button"
            onClick={onFocus}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-[11px] bg-[#1d1d21] px-3 text-xs font-semibold text-white transition hover:bg-[#303036]"
          >
            Open lens
            <ArrowRight size={12} />
          </button>
          {item.status !== "Shortlisted" && item.status !== "Included" ? (
            <button
              type="button"
              onClick={() => onStatus("Shortlisted")}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-[11px] border border-black/[0.07] bg-white px-3 text-xs font-semibold text-[#57575f] hover:text-[#1d1d21]"
            >
              <Bookmark size={12} />
              Shortlist
            </button>
          ) : null}
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-[11px] px-3 text-xs font-semibold text-[#8b8b94] hover:bg-black/[0.035] hover:text-[#34343a]"
            >
              Original
              <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function FocusedSignal({
  item,
  onStatus,
}: {
  item: NewsItem | null;
  onStatus: (status: NewsStatus) => void;
}) {
  if (!item) {
    return <QuietState icon={Newspaper} text="Select a signal to open its intelligence lens." />;
  }
  const source = provenance(item.channel);
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101116] p-5 text-white shadow-[0_28px_90px_rgba(15,17,26,0.18)]">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/34">Focused intelligence</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold text-white/62">
              <ShieldCheck size={11} className="text-emerald-300" />
              {source.label}
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-semibold tracking-[-0.07em]">{item.score}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">Watch score</p>
          </div>
        </div>
        <h3 className="mt-6 text-2xl font-semibold leading-8 tracking-[-0.04em]">{item.headline}</h3>
        <p className="mt-4 text-sm leading-6 text-white/52">{item.summary || "The source did not supply a summary. Open the original before using this signal."}</p>

        <div className="mt-5 space-y-2.5 rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-4">
          <LensRow label="Publisher" value={item.source || "Not supplied"} />
          <LensRow label="Topic" value={item.topic} />
          <LensRow label="Published" value={publishedDate(item.publishedAt)} />
          <LensRow label="Provenance" value={source.note} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[13px] bg-white px-4 text-xs font-semibold text-[#17171b]"
            >
              Read original
              <ExternalLink size={13} />
            </a>
          ) : null}
          {item.status !== "Shortlisted" && item.status !== "Included" ? (
            <button
              type="button"
              onClick={() => onStatus("Shortlisted")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[13px] border border-white/12 bg-white/[0.07] px-4 text-xs font-semibold text-white"
            >
              <Bookmark size={13} />
              Shortlist
            </button>
          ) : null}
          {item.status !== "Dismissed" ? (
            <button type="button" onClick={() => onStatus("Dismissed")} className="min-h-11 rounded-[13px] px-4 text-xs font-semibold text-white/38 hover:bg-white/[0.06] hover:text-rose-300">
              Dismiss
            </button>
          ) : (
            <button type="button" onClick={() => onStatus("New")} className="min-h-11 rounded-[13px] px-4 text-xs font-semibold text-white/52 hover:bg-white/[0.06]">
              Restore
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function LensRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="shrink-0 text-white/30">{label}</span>
      <span className="text-right font-medium leading-5 text-white/68">{value}</span>
    </div>
  );
}

function QuietState({
  text,
  icon: Icon = Sparkles,
  action,
}: {
  text: string;
  icon?: ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-black/[0.09] bg-white/42 p-7 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#F0EEFF] text-[#6D5DFC]">
        <Icon size={18} />
      </span>
      <p className="mt-4 max-w-sm text-sm leading-6 text-[#8f8f97]">{text}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function NewsLoading() {
  return (
    <div className="space-y-5">
      <div className="relative min-h-[35rem] overflow-hidden rounded-[2.8rem] bg-[#08090d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(108,86,255,0.28),transparent_32%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full border border-violet-300/20" />
            <div className="absolute inset-4 animate-pulse rounded-full border border-white/12" />
            <Radar size={26} />
          </div>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.28em] text-white/38">Opening the intelligence room</p>
          <p className="mt-3 text-lg font-semibold">Separating signal from noise…</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-[1.7rem] border border-black/[0.055] bg-white/55" />
        ))}
      </div>
    </div>
  );
}
