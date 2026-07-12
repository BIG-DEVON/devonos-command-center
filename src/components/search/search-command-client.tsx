"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Copy,
  Crown,
  Database,
  FileText,
  Folder,
  RefreshCcw,
  Search,
  Share2,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

type ModuleFilter =
  | "All"
  | "KPI"
  | "Social"
  | "Assets"
  | "Events"
  | "Birthdays"
  | "AI";

type SearchResult = {
  id: string;
  module: Exclude<ModuleFilter, "All">;
  title: string;
  subtitle: string;
  body: string;
  status: string;
  href: string;
  createdAt: string;
  rawText: string;
};

const moduleFilters: ModuleFilter[] = [
  "All",
  "KPI",
  "Social",
  "Assets",
  "Events",
  "Birthdays",
  "AI",
];

const STORAGE_KEYS = {
  kpis: "devonos.kpis.v1",
  social: "devonos.social-drafts.v1",
  assets: "devonos.assets.v1",
  events: "devonos.global-events.v1",
  birthdays: "devonos.birthdays.v1",
  ai: "devonos.ai-studio.v1",
};

function safeReadArray(key: string): Record<string, unknown>[] {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  return "";
}

function pickString(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = stringValue(item[key]);
    if (value.trim()) return value.trim();
  }

  return "";
}

function recordText(item: Record<string, unknown>) {
  return Object.values(item)
    .map((value) => {
      if (typeof value === "string") return value;
      if (typeof value === "number") return String(value);
      if (typeof value === "boolean") return String(value);
      return "";
    })
    .join(" ")
    .trim();
}

function formatDate(dateString: string) {
  if (!dateString) return "No date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function moduleIcon(module: SearchResult["module"]) {
  if (module === "KPI") return Target;
  if (module === "Social") return Share2;
  if (module === "Assets") return Folder;
  if (module === "Events") return CalendarDays;
  if (module === "Birthdays") return Users;
  return Bot;
}

function moduleClass(module: SearchResult["module"]) {
  if (module === "KPI") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (module === "Social") {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (module === "Assets") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (module === "Events") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (module === "Birthdays") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function filterClass(filter: ModuleFilter, active: ModuleFilter) {
  if (filter === active) {
    return "border-[#0B0D12] bg-[#0B0D12] text-white shadow-[0_16px_45px_rgba(15,23,42,0.18)]";
  }

  return "border-slate-950/[0.08] bg-white/72 text-slate-500 hover:bg-white hover:text-[#0B0D12]";
}

function buildSearchIndex(): SearchResult[] {
  const kpis = safeReadArray(STORAGE_KEYS.kpis).map((item, index) => {
    const title =
      pickString(item, ["title", "name", "objective"]) || `KPI Item ${index + 1}`;

    const status = pickString(item, ["status"]) || "No status";
    const priority = pickString(item, ["priority"]);
    const owner = pickString(item, ["owner", "assignee"]);
    const description = pickString(item, [
      "description",
      "notes",
      "outcome",
      "details",
    ]);

    return {
      id: `kpi-${pickString(item, ["id"]) || index}`,
      module: "KPI" as const,
      title,
      subtitle: [status, priority, owner].filter(Boolean).join(" · "),
      body: description || recordText(item),
      status,
      href: "/kpi",
      createdAt: pickString(item, ["createdAt", "date", "dueDate"]),
      rawText: recordText(item),
    };
  });

  const social = safeReadArray(STORAGE_KEYS.social).map((item, index) => {
    const title =
      pickString(item, ["title", "campaign"]) || `Social Draft ${index + 1}`;

    const status = pickString(item, ["status"]) || "No status";
    const platform = pickString(item, ["platform"]);
    const campaign = pickString(item, ["campaign"]);
    const caption = pickString(item, ["caption", "visualDirection", "notes"]);

    return {
      id: `social-${pickString(item, ["id"]) || index}`,
      module: "Social" as const,
      title,
      subtitle: [platform, status, campaign].filter(Boolean).join(" · "),
      body: caption || recordText(item),
      status,
      href: "/social",
      createdAt: pickString(item, ["createdAt", "scheduledDate"]),
      rawText: recordText(item),
    };
  });

  const assets = safeReadArray(STORAGE_KEYS.assets).map((item, index) => {
    const title =
      pickString(item, ["name", "title"]) || `Asset Record ${index + 1}`;

    const status = pickString(item, ["status"]) || "No status";
    const type = pickString(item, ["type"]);
    const project = pickString(item, ["project"]);
    const notes = pickString(item, ["notes", "tags", "link"]);

    return {
      id: `asset-${pickString(item, ["id"]) || index}`,
      module: "Assets" as const,
      title,
      subtitle: [type, status, project].filter(Boolean).join(" · "),
      body: notes || recordText(item),
      status,
      href: "/assets",
      createdAt: pickString(item, ["createdAt"]),
      rawText: recordText(item),
    };
  });

  const events = safeReadArray(STORAGE_KEYS.events).map((item, index) => {
    const title =
      pickString(item, ["title", "name"]) || `Event ${index + 1}`;

    const status = pickString(item, ["status"]) || "No status";
    const category = pickString(item, ["category"]);
    const date = pickString(item, ["date"]);
    const body = pickString(item, [
      "contentAngle",
      "visualDirection",
      "captionDraft",
      "notes",
    ]);

    return {
      id: `event-${pickString(item, ["id"]) || index}`,
      module: "Events" as const,
      title,
      subtitle: [category, status, date].filter(Boolean).join(" · "),
      body: body || recordText(item),
      status,
      href: "/events",
      createdAt: pickString(item, ["createdAt", "date"]),
      rawText: recordText(item),
    };
  });

  const birthdays = safeReadArray(STORAGE_KEYS.birthdays).map((item, index) => {
    const title =
      pickString(item, ["name", "title"]) || `Birthday Profile ${index + 1}`;

    const role = pickString(item, ["role"]);
    const category = pickString(item, ["category"]);
    const tone = pickString(item, ["preferredTone"]);
    const notes = pickString(item, ["notes"]);

    return {
      id: `birthday-${pickString(item, ["id"]) || index}`,
      module: "Birthdays" as const,
      title,
      subtitle: [role, category, tone].filter(Boolean).join(" · "),
      body: notes || recordText(item),
      status: tone || "Saved",
      href: "/birthdays",
      createdAt: pickString(item, ["createdAt"]),
      rawText: recordText(item),
    };
  });

  const ai = safeReadArray(STORAGE_KEYS.ai).map((item, index) => {
    const title =
      pickString(item, ["title", "name"]) || `AI Draft ${index + 1}`;

    const status = pickString(item, ["status"]) || "No status";
    const category = pickString(item, ["category"]);
    const tone = pickString(item, ["tone"]);
    const body = pickString(item, [
      "output",
      "instruction",
      "sourceText",
      "notes",
    ]);

    return {
      id: `ai-${pickString(item, ["id"]) || index}`,
      module: "AI" as const,
      title,
      subtitle: [category, tone, status].filter(Boolean).join(" · "),
      body: body || recordText(item),
      status,
      href: "/ai",
      createdAt: pickString(item, ["createdAt"]),
      rawText: recordText(item),
    };
  });

  return [...kpis, ...social, ...assets, ...events, ...birthdays, ...ai];
}

function buildExportText(result: SearchResult | null) {
  if (!result) return "Select a search result to preview it.";

  return [
    result.title,
    "",
    `Module: ${result.module}`,
    `Status: ${result.status || "No status"}`,
    `Location: ${result.href}`,
    result.subtitle ? `Details: ${result.subtitle}` : "",
    result.createdAt ? `Date: ${formatDate(result.createdAt)}` : "",
    "",
    "Content:",
    result.body || "No detailed content available.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function SearchCommandClient() {
  const [index, setIndex] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("");

  function refreshIndex() {
    const nextIndex = buildSearchIndex();
    setIndex(nextIndex);
    setSelectedId(nextIndex[0]?.id ?? null);

    setLastRefresh(
      new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date())
    );
  }

  useEffect(() => {
    refreshIndex();
  }, []);

  const filteredResults = useMemo(() => {
    const search = query.trim().toLowerCase();

    return index.filter((result) => {
      const matchesModule =
        moduleFilter === "All" || result.module === moduleFilter;

      const matchesQuery =
        !search ||
        [
          result.title,
          result.subtitle,
          result.body,
          result.status,
          result.module,
          result.rawText,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return matchesModule && matchesQuery;
    });
  }, [index, moduleFilter, query]);

  const selectedResult = useMemo(() => {
    if (!selectedId) return filteredResults[0] ?? null;

    return (
      index.find((result) => result.id === selectedId) ??
      filteredResults[0] ??
      null
    );
  }, [filteredResults, index, selectedId]);

  const exportText = buildExportText(selectedResult);

  const moduleCounts = useMemo(() => {
    return {
      KPI: index.filter((item) => item.module === "KPI").length,
      Social: index.filter((item) => item.module === "Social").length,
      Assets: index.filter((item) => item.module === "Assets").length,
      Events: index.filter((item) => item.module === "Events").length,
      Birthdays: index.filter((item) => item.module === "Birthdays").length,
      AI: index.filter((item) => item.module === "AI").length,
    };
  }, [index]);

  async function copyResult() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Crown size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                Universal Index
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {index.length} records indexed
              </h2>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/38"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search anything in DevonOS..."
                className="w-full rounded-2xl border border-white/10 bg-black/25 py-3.5 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-white/28 focus:border-white/25 focus:bg-black/35"
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-white/42">
              Last refreshed: {lastRefresh || "Not refreshed yet"}
            </p>
          </div>

          <button
            onClick={refreshIndex}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh Search Index
          </button>
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
              <Database size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Module Filters
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Narrow search to one workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {moduleFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setModuleFilter(filter)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition duration-300 ${filterClass(
                  filter,
                  moduleFilter
                )}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetricCard
            title="KPI"
            value={moduleCounts.KPI}
            sub="Execution records"
            icon={Target}
          />
          <MetricCard
            title="Social"
            value={moduleCounts.Social}
            sub="Post drafts"
            icon={Share2}
          />
          <MetricCard
            title="Assets"
            value={moduleCounts.Assets}
            sub="Creative files"
            icon={Folder}
          />
          <MetricCard
            title="AI"
            value={moduleCounts.AI}
            sub="Generated drafts"
            icon={Bot}
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Search size={14} className="text-[#5B5DF5]" />
                Search Results
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                {filteredResults.length} result
                {filteredResults.length === 1 ? "" : "s"} found
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Search finds matching records stored across your DevonOS modules.
              </p>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <Search size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No matching records
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Try another keyword or refresh the search index.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((result) => {
                const Icon = moduleIcon(result.module);
                const isSelected = selectedResult?.id === result.id;

                return (
                  <div
                    key={result.id}
                    className={`rounded-[1.65rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                      isSelected
                        ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                        : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                    }`}
                  >
                    <div className="mb-4 flex justify-between gap-4">
                      <button
                        onClick={() => setSelectedId(result.id)}
                        className="flex flex-1 gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                          <Icon size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {result.title}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {result.subtitle || result.module}
                          </p>
                        </div>
                      </button>

                      <Link
                        href={result.href}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-[#0B0D12]"
                        aria-label="Open module"
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${moduleClass(
                          result.module
                        )}`}
                      >
                        {result.module}
                      </span>

                      {result.status ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {result.status}
                        </span>
                      ) : null}

                      {result.createdAt ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-400">
                          {formatDate(result.createdAt)}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm leading-6 text-slate-500">
                      {result.body || "No preview available."}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Result Preview
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Copy the selected record.
              </p>
            </div>

            <button
              onClick={copyResult}
              disabled={!selectedResult}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Result"}
            </button>
          </div>

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {exportText}
            </pre>
          </div>
        </div>
      </div>
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