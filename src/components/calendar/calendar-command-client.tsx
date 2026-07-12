"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Database,
  RefreshCcw,
  Search,
  Share2,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

type CalendarSource = "Events" | "Social" | "KPI" | "Birthdays";

type CalendarItem = {
  id: string;
  source: CalendarSource;
  title: string;
  date: string;
  subtitle: string;
  status: string;
  body: string;
  href: string;
  rawText: string;
};

type TimeFilter = "All" | "Today" | "7 Days" | "30 Days" | "Past";

const timeFilters: TimeFilter[] = ["All", "Today", "7 Days", "30 Days", "Past"];

const STORAGE_KEYS = {
  events: "devonos.global-events.v1",
  social: "devonos.social-drafts.v1",
  kpis: "devonos.kpis.v1",
  birthdays: "devonos.birthdays.v1",
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

function numberValue(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
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

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizeDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function getDaysUntil(dateString: string) {
  if (!dateString) return 999999;

  const today = todayStart();
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  if (Number.isNaN(date.getTime())) return 999999;

  const diff = date.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string) {
  if (!dateString) return "No date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function dateLabel(dateString: string) {
  const days = getDaysUntil(dateString);

  if (days === 999999) return "No date";
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function birthdayDateForThisYear(item: Record<string, unknown>) {
  const month = numberValue(item.month);
  const day = numberValue(item.day);

  if (!month || !day) return "";

  const now = new Date();
  let year = now.getFullYear();

  let date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() < todayStart().getTime()) {
    year += 1;
    date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
  }

  return date.toISOString().slice(0, 10);
}

function sourceIcon(source: CalendarSource) {
  if (source === "Events") return CalendarDays;
  if (source === "Social") return Share2;
  if (source === "KPI") return Target;
  return Users;
}

function sourceClass(source: CalendarSource) {
  if (source === "Events") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (source === "Social") {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (source === "KPI") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  return "border-red-100 bg-red-50 text-red-600";
}

function timeFilterClass(filter: TimeFilter, active: TimeFilter) {
  if (filter === active) {
    return "border-[#0B0D12] bg-[#0B0D12] text-white shadow-[0_16px_45px_rgba(15,23,42,0.18)]";
  }

  return "border-slate-950/[0.08] bg-white/72 text-slate-500 hover:bg-white hover:text-[#0B0D12]";
}

function buildCalendarIndex(): CalendarItem[] {
  const events = safeReadArray(STORAGE_KEYS.events).map((item, index) => {
    const title =
      pickString(item, ["title", "name"]) || `Event ${index + 1}`;
    const date = normalizeDate(pickString(item, ["date"]));
    const status = pickString(item, ["status"]) || "Saved";
    const category = pickString(item, ["category"]);
    const body = pickString(item, [
      "contentAngle",
      "visualDirection",
      "captionDraft",
      "notes",
    ]);

    return {
      id: `event-${pickString(item, ["id"]) || index}`,
      source: "Events" as const,
      title,
      date,
      subtitle: [category, status].filter(Boolean).join(" · "),
      status,
      body: body || recordText(item),
      href: "/events",
      rawText: recordText(item),
    };
  });

  const social = safeReadArray(STORAGE_KEYS.social)
    .filter((item) => pickString(item, ["scheduledDate"]))
    .map((item, index) => {
      const title =
        pickString(item, ["title", "campaign"]) || `Social Draft ${index + 1}`;
      const date = normalizeDate(pickString(item, ["scheduledDate"]));
      const status = pickString(item, ["status"]) || "Scheduled";
      const platform = pickString(item, ["platform"]);
      const campaign = pickString(item, ["campaign"]);
      const body = pickString(item, ["caption", "visualDirection", "notes"]);

      return {
        id: `social-${pickString(item, ["id"]) || index}`,
        source: "Social" as const,
        title,
        date,
        subtitle: [platform, campaign, status].filter(Boolean).join(" · "),
        status,
        body: body || recordText(item),
        href: "/social",
        rawText: recordText(item),
      };
    });

  const kpis = safeReadArray(STORAGE_KEYS.kpis)
    .filter((item) => pickString(item, ["dueDate", "date", "deadline"]))
    .map((item, index) => {
      const title =
        pickString(item, ["title", "name", "objective"]) ||
        `KPI Item ${index + 1}`;
      const date = normalizeDate(pickString(item, ["dueDate", "date", "deadline"]));
      const status = pickString(item, ["status"]) || "Tracked";
      const priority = pickString(item, ["priority"]);
      const owner = pickString(item, ["owner", "assignee"]);
      const body = pickString(item, ["description", "notes", "outcome"]);

      return {
        id: `kpi-${pickString(item, ["id"]) || index}`,
        source: "KPI" as const,
        title,
        date,
        subtitle: [priority, owner, status].filter(Boolean).join(" · "),
        status,
        body: body || recordText(item),
        href: "/kpi",
        rawText: recordText(item),
      };
    });

  const birthdays = safeReadArray(STORAGE_KEYS.birthdays).map((item, index) => {
    const title =
      pickString(item, ["name", "title"]) || `Birthday Profile ${index + 1}`;
    const date = birthdayDateForThisYear(item);
    const role = pickString(item, ["role"]);
    const category = pickString(item, ["category"]);
    const tone = pickString(item, ["preferredTone"]);
    const notes = pickString(item, ["notes"]);

    return {
      id: `birthday-${pickString(item, ["id"]) || index}`,
      source: "Birthdays" as const,
      title: `${title}'s Birthday`,
      date,
      subtitle: [role, category, tone].filter(Boolean).join(" · "),
      status: tone || "Birthday",
      body: notes || recordText(item),
      href: "/birthdays",
      rawText: recordText(item),
    };
  });

  return [...events, ...social, ...kpis, ...birthdays]
    .filter((item) => item.date)
    .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
}

function buildExportText(item: CalendarItem | null) {
  if (!item) return "Select a calendar item to preview it.";

  return [
    item.title,
    "",
    `Source: ${item.source}`,
    `Date: ${formatDate(item.date)} (${dateLabel(item.date)})`,
    `Status: ${item.status}`,
    item.subtitle ? `Details: ${item.subtitle}` : "",
    `Open: ${item.href}`,
    "",
    "Notes:",
    item.body || "No notes available.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function CalendarCommandClient() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [query, setQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("");

  function refreshCalendar() {
    const nextItems = buildCalendarIndex();
    setItems(nextItems);
    setSelectedId(nextItems[0]?.id ?? null);

    setLastRefresh(
      new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date())
    );
  }

  useEffect(() => {
    refreshCalendar();
  }, []);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    return items.filter((item) => {
      const days = getDaysUntil(item.date);

      const matchesTime =
        timeFilter === "All" ||
        (timeFilter === "Today" && days === 0) ||
        (timeFilter === "7 Days" && days >= 0 && days <= 7) ||
        (timeFilter === "30 Days" && days >= 0 && days <= 30) ||
        (timeFilter === "Past" && days < 0);

      const matchesQuery =
        !search ||
        [
          item.title,
          item.subtitle,
          item.status,
          item.source,
          item.body,
          item.rawText,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return matchesTime && matchesQuery;
    });
  }, [items, query, timeFilter]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return filteredItems[0] ?? null;

    return (
      items.find((item) => item.id === selectedId) ??
      filteredItems[0] ??
      null
    );
  }, [filteredItems, items, selectedId]);

  const todayCount = items.filter((item) => getDaysUntil(item.date) === 0).length;
  const weekCount = items.filter((item) => {
    const days = getDaysUntil(item.date);
    return days >= 0 && days <= 7;
  }).length;
  const monthCount = items.filter((item) => {
    const days = getDaysUntil(item.date);
    return days >= 0 && days <= 30;
  }).length;
  const pastCount = items.filter((item) => getDaysUntil(item.date) < 0).length;

  const sourceCounts = useMemo(() => {
    return {
      Events: items.filter((item) => item.source === "Events").length,
      Social: items.filter((item) => item.source === "Social").length,
      KPI: items.filter((item) => item.source === "KPI").length,
      Birthdays: items.filter((item) => item.source === "Birthdays").length,
    };
  }, [items]);

  const exportText = buildExportText(selectedItem);

  async function copyItem() {
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
                Calendar Intelligence
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {items.length} calendar signals
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
                placeholder="Search calendar..."
                className="w-full rounded-2xl border border-white/10 bg-black/25 py-3.5 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-white/28 focus:border-white/25 focus:bg-black/35"
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-white/42">
              Last refreshed: {lastRefresh || "Not refreshed yet"}
            </p>
          </div>

          <button
            onClick={refreshCalendar}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh Calendar
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetricCard
            title="Today"
            value={todayCount}
            sub="Due now"
            icon={Clock}
          />
          <MetricCard
            title="This Week"
            value={weekCount}
            sub="Next 7 days"
            icon={CalendarDays}
          />
          <MetricCard
            title="This Month"
            value={monthCount}
            sub="Next 30 days"
            icon={Sparkles}
          />
          <MetricCard
            title="Past"
            value={pastCount}
            sub="Needs review"
            icon={CheckCircle2}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
              <Database size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Time Filters
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Focus on the dates that matter.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition duration-300 ${timeFilterClass(
                  filter,
                  timeFilter
                )}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SmallSourceCard
            title="Events"
            value={sourceCounts.Events}
            icon={CalendarDays}
          />
          <SmallSourceCard
            title="Social"
            value={sourceCounts.Social}
            icon={Share2}
          />
          <SmallSourceCard title="KPI" value={sourceCounts.KPI} icon={Target} />
          <SmallSourceCard
            title="Birthdays"
            value={sourceCounts.Birthdays}
            icon={Users}
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <CalendarDays size={14} className="text-[#5B5DF5]" />
                Agenda
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                {filteredItems.length} item
                {filteredItems.length === 1 ? "" : "s"} in view
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                DevonOS pulls upcoming dates from your saved modules.
              </p>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <CalendarDays size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No calendar items found
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add events, birthdays, scheduled posts, or KPI due dates.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const Icon = sourceIcon(item.source);
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
                    <div className="mb-4 flex justify-between gap-4">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="flex flex-1 gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                          <Icon size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {formatDate(item.date)} · {dateLabel(item.date)}
                          </p>
                        </div>
                      </button>

                      <Link
                        href={item.href}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-[#0B0D12]"
                        aria-label="Open module"
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${sourceClass(
                          item.source
                        )}`}
                      >
                        {item.source}
                      </span>

                      {item.status ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {item.status}
                        </span>
                      ) : null}

                      <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-400">
                        {dateLabel(item.date)}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-slate-500">
                      {item.body || item.subtitle || "No preview available."}
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
                Calendar Preview
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Copy the selected calendar note.
              </p>
            </div>

            <button
              onClick={copyItem}
              disabled={!selectedItem}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Item"}
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

function SmallSourceCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: ElementType;
}) {
  return (
    <div className="devon-glass rounded-[1.45rem] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-600">
        <Icon size={17} />
      </div>

      <p className="text-2xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
    </div>
  );
}