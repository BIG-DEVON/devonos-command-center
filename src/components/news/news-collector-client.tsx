"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  FileText,
  Newspaper,
  Plus,
  Radio,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

type NewsRelevance = "High" | "Medium" | "Low";

type NewsItem = {
  id: string;
  headline: string;
  source: string;
  url: string;
  summary: string;
  relevance: NewsRelevance;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type NewsForm = {
  headline: string;
  source: string;
  url: string;
  summary: string;
  relevance: NewsRelevance;
  notes: string;
};

type NewsApiResponse = {
  ok: boolean;
  newsItems?: NewsItem[];
  newsItem?: NewsItem;
  message?: string;
};

const relevances: NewsRelevance[] = ["High", "Medium", "Low"];

const emptyForm: NewsForm = {
  headline: "",
  source: "",
  url: "",
  summary: "",
  relevance: "Medium",
  notes: "",
};

function normalizeNewsItem(item: Partial<NewsItem>): NewsItem {
  return {
    id: item.id ?? "",
    headline: item.headline ?? "",
    source: item.source ?? "",
    url: item.url ?? "",
    summary: item.summary ?? "",
    relevance: (item.relevance ?? "Medium") as NewsRelevance,
    notes: item.notes ?? "",
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function formatDate(dateString: string) {
  if (!dateString) return "No date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "No date";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function relevanceClass(relevance: NewsRelevance) {
  if (relevance === "High") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (relevance === "Medium") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function buildSingleNewsBrief(item: NewsItem | null) {
  if (!item) return "Select a news item to preview its brief.";

  return [
    item.headline,
    "",
    `Source: ${item.source || "No source added"}`,
    `Relevance: ${item.relevance}`,
    `URL: ${item.url || "No URL added"}`,
    `Saved: ${formatDate(item.createdAt)}`,
    "",
    "Summary:",
    item.summary || "No summary added.",
    "",
    "Notes:",
    item.notes || "No notes added.",
  ].join("\n");
}

function buildDailyBrief(items: NewsItem[]) {
  if (items.length === 0) {
    return "Add news items to generate a daily intelligence brief.";
  }

  const highItems = items.filter((item) => item.relevance === "High");
  const mediumItems = items.filter((item) => item.relevance === "Medium");
  const lowItems = items.filter((item) => item.relevance === "Low");

  const orderedItems = [...highItems, ...mediumItems, ...lowItems];

  return [
    "DEVONOS DAILY NEWS INTELLIGENCE BRIEF",
    "",
    `Generated: ${formatDate(new Date().toISOString())}`,
    `Total Signals: ${items.length}`,
    `High Relevance: ${highItems.length}`,
    "",
    "Executive Summary:",
    "The following news signals have been collected for review, monitoring, and possible communication action.",
    "",
    ...orderedItems.flatMap((item, index) => [
      `${index + 1}. ${item.headline}`,
      `Source: ${item.source || "Not stated"}`,
      `Relevance: ${item.relevance}`,
      `Link: ${item.url || "No link provided"}`,
      `Summary: ${item.summary || "No summary added."}`,
      item.notes ? `Notes: ${item.notes}` : "",
      "",
    ]),
    "Recommended Next Step:",
    "Review the high-relevance items first, confirm accuracy from official sources where necessary, then convert approved items into social posts, internal briefs, or monitoring notes.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function NewsCollectorClient() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedItem, setCopiedItem] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadNewsItems() {
    try {
      setErrorMessage("");

      const response = await fetch("/api/news", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load news items.");
      }

      const data = (await response.json()) as NewsApiResponse;

      if (!data.ok || !data.newsItems) {
        throw new Error(data.message || "News response was invalid.");
      }

      const nextItems = data.newsItems.map(normalizeNewsItem);

      setItems(nextItems);

      if (!selectedId) {
        setSelectedId(nextItems[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Failed to load news items:", error);
      setErrorMessage("News items could not be loaded from the database.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    loadNewsItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return items;

    return items.filter((item) =>
      [
        item.headline,
        item.source,
        item.url,
        item.summary,
        item.relevance,
        item.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [items, query]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return filteredItems[0] ?? null;

    return (
      items.find((item) => item.id === selectedId) ??
      filteredItems[0] ??
      null
    );
  }, [filteredItems, items, selectedId]);

  const highRelevanceItems = items.filter(
    (item) => item.relevance === "High"
  ).length;

  const mediumRelevanceItems = items.filter(
    (item) => item.relevance === "Medium"
  ).length;

  const lowRelevanceItems = items.filter(
    (item) => item.relevance === "Low"
  ).length;

  const sourcedItems = items.filter((item) => item.url || item.source).length;

  const dailyBrief = buildDailyBrief(items);
  const selectedBrief = buildSingleNewsBrief(selectedItem);

  function updateForm<Key extends keyof NewsForm>(
    key: Key,
    value: NewsForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrorMessage("");
  }

  async function addNewsItem() {
    if (!form.headline.trim()) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create news item.");
      }

      const data = (await response.json()) as NewsApiResponse;

      if (!data.ok || !data.newsItem) {
        throw new Error(data.message || "News response was invalid.");
      }

      const newItem = normalizeNewsItem(data.newsItem);

      setItems((current) => [newItem, ...current]);
      setSelectedId(newItem.id);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to create news item:", error);
      setErrorMessage("News item could not be saved to the database.");
    } finally {
      setSaving(false);
    }
  }

  async function updateRelevance(id: string, relevance: NewsRelevance) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ relevance }),
      });

      if (!response.ok) {
        throw new Error("Failed to update news item.");
      }

      const data = (await response.json()) as NewsApiResponse;

      if (!data.ok || !data.newsItem) {
        throw new Error(data.message || "News response was invalid.");
      }

      const updatedItem = normalizeNewsItem(data.newsItem);

      setItems((current) =>
        current.map((item) => (item.id === id ? updatedItem : item))
      );
    } catch (error) {
      console.error("Failed to update news item:", error);
      setErrorMessage("News relevance could not be updated.");
    }
  }

  async function removeNewsItem(id: string) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete news item.");
      }

      setItems((current) => current.filter((item) => item.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to delete news item:", error);
      setErrorMessage("News item could not be deleted.");
    }
  }

  async function copyDailyBrief() {
    await navigator.clipboard.writeText(dailyBrief);
    setCopiedBrief(true);

    window.setTimeout(() => {
      setCopiedBrief(false);
    }, 1600);
  }

  async function copySelectedItem() {
    await navigator.clipboard.writeText(selectedBrief);
    setCopiedItem(true);

    window.setTimeout(() => {
      setCopiedItem(false);
    }, 1600);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Newspaper size={14} className="text-[#5B5DF5]" />
                News Collector
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add a news signal
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Save headlines, sources, links, summaries, relevance levels,
                and monitoring notes directly into your Prisma database.
              </p>
            </div>

            <button
              onClick={addNewsItem}
              disabled={saving || !loaded}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? "Saving..." : "Save News"}
            </button>
          </div>

          {errorMessage ? (
            <div className="mb-5 rounded-[1.4rem] border border-red-100 bg-red-50 p-4 text-red-600">
              <div className="flex gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm leading-6">{errorMessage}</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Headline
              </span>
              <input
                value={form.headline}
                onChange={(event) => updateForm("headline", event.target.value)}
                placeholder="Paste or write the news headline..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Source
              </span>
              <input
                value={form.source}
                onChange={(event) => updateForm("source", event.target.value)}
                placeholder="e.g. NTA, FIRS, Punch, Official website..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Relevance
              </span>
              <select
                value={form.relevance}
                onChange={(event) =>
                  updateForm("relevance", event.target.value as NewsRelevance)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {relevances.map((relevance) => (
                  <option key={relevance}>{relevance}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                News URL
              </span>
              <input
                value={form.url}
                onChange={(event) => updateForm("url", event.target.value)}
                placeholder="Paste article, official release, social link, or source URL..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Summary
              </span>
              <textarea
                value={form.summary}
                onChange={(event) => updateForm("summary", event.target.value)}
                placeholder="Summarize what happened and why it matters..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Notes
              </span>
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder="Action needed, content idea, verification note, or internal comment..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>
          </div>
        </div>

        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Crown size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                Intelligence Brief
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {items.length} database signals
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <DarkMetric value={highRelevanceItems} label="High" />
            <DarkMetric value={mediumRelevanceItems} label="Medium" />
            <DarkMetric value={lowRelevanceItems} label="Low" />
            <DarkMetric value={sourcedItems} label="Sourced" />
          </div>

          <button
            onClick={loadNewsItems}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh News Data
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Signals"
            value={items.length}
            sub="Database records"
            icon={Radio}
          />
          <MetricCard
            title="High"
            value={highRelevanceItems}
            sub="Priority watch"
            icon={Sparkles}
          />
          <MetricCard
            title="Sources"
            value={sourcedItems}
            sub="Traceable items"
            icon={ExternalLink}
          />
          <MetricCard
            title="Brief"
            value={items.length ? 1 : 0}
            sub="Generated daily"
            icon={Bot}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                News Signal Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, preview, classify, and delete database-backed news
                signals.
              </p>
            </div>

            <div className="relative min-w-full md:min-w-[280px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search news signals..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {!loaded ? (
            <EmptyState
              icon={RefreshCcw}
              title="Loading news signals"
              text="Fetching records from the database."
            />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="No news signals found"
              text="Add your first news item to begin building your intelligence brief."
            />
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-[1.65rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                      isSelected
                        ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                        : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                    }`}
                  >
                    <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="flex flex-1 gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                          <Newspaper size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {item.headline}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {item.source || "No source"} ·{" "}
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </button>

                      <div className="flex gap-2">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-[#5B5DF5]"
                            aria-label="Open source"
                          >
                            <ExternalLink size={16} />
                          </a>
                        ) : null}

                        <button
                          onClick={() => removeNewsItem(item.id)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                          aria-label="Remove news item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${relevanceClass(
                          item.relevance
                        )}`}
                      >
                        {item.relevance} relevance
                      </span>

                      {item.source ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {item.source}
                        </span>
                      ) : null}

                      {item.url ? (
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          Linked source
                        </span>
                      ) : null}
                    </div>

                    {item.summary ? (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {item.summary}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {relevances.map((relevance) => (
                        <button
                          key={relevance}
                          onClick={() => updateRelevance(item.id, relevance)}
                          className="rounded-full border border-slate-950/[0.08] bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-[#0B0D12]"
                        >
                          {relevance}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="devon-glass rounded-[2.25rem] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Selected Signal
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Copy one selected news brief.
                </p>
              </div>

              <button
                onClick={copySelectedItem}
                disabled={!selectedItem}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copiedItem ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copiedItem ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                {selectedBrief}
              </pre>
            </div>
          </div>

          <div className="devon-glass rounded-[2.25rem] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Daily Brief
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Copy the full generated intelligence brief.
                </p>
              </div>

              <button
                onClick={copyDailyBrief}
                disabled={!items.length}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copiedBrief ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copiedBrief ? "Copied" : "Copy Brief"}
              </button>
            </div>

            <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                {dailyBrief}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DarkMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-white/38">{label}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
        <Icon size={20} />
      </div>
      <h3 className="text-base font-semibold text-[#0B0D12]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string;
  value: number;
  sub: string;
  icon: ElementType;
}) {
  return (
    <div className="devon-glass rounded-[1.7rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
          <Icon size={18} />
        </div>

        <ArrowUpRight size={16} className="text-slate-300" />
      </div>

      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>
    </div>
  );
}