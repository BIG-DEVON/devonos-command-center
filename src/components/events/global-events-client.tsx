"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Flag,
  Globe2,
  Landmark,
  Layers3,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  morrowObservances,
  type MorrowObservance,
  type ObservanceScope,
} from "@/data/morrow-observances";
import { MorrowInlineLoader } from "@/components/ui/morrow-loading";

type EventCategory =
  | "Global Observance"
  | "National Day"
  | "Internal Event"
  | "Tax & Revenue"
  | "Public Service"
  | "Media & Communication"
  | "Custom";
type EventRelevance = "High" | "Medium" | "Low";
type EventStatus = "Idea" | "Drafting" | "Approved" | "Posted" | "Skipped";
type WorkspaceEvent = {
  id: string;
  title: string;
  date: string;
  category: EventCategory;
  relevance: EventRelevance;
  status: EventStatus;
  contentAngle: string;
  visualDirection: string;
  captionDraft: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};
type DisplayEvent = MorrowObservance & {
  workspaceId?: string;
  workspaceStatus?: EventStatus;
};
type ScopeFilter = "All" | ObservanceScope | "Planned";
type TimeFilter = "Upcoming" | "This month" | "All year";

const scopeFilters: ScopeFilter[] = ["All", "Nigeria", "JRB", "World", "Planned"];
const timeFilters: TimeFilter[] = ["Upcoming", "This month", "All year"];
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekdayInitials = ["S", "M", "T", "W", "T", "F", "S"];

function dateAtNoon(value: string) {
  return new Date(`${value}T12:00:00`);
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function daysUntil(value: string) {
  const today = dateAtNoon(todayKey()).getTime();
  return Math.round((dateAtNoon(value).getTime() - today) / 86400000);
}

function formatDate(value: string, compact = false) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: compact ? undefined : "long",
    day: "numeric",
    month: compact ? "short" : "long",
    year: "numeric",
  }).format(dateAtNoon(value));
}

function countdown(value: string) {
  const days = daysUntil(value);
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days away`;
}

function categoryFromObservance(event: MorrowObservance): EventCategory {
  if (event.kind === "Compliance" || event.scopes.includes("JRB")) return "Tax & Revenue";
  if (event.kind === "Public Holiday" || event.scopes.includes("Nigeria")) return "National Day";
  return "Global Observance";
}

function relevanceFromObservance(event: MorrowObservance): EventRelevance {
  if (event.relevance === "Essential") return "High";
  return event.relevance;
}

function icsFor(event: DisplayEvent) {
  const next = new Date(dateAtNoon(event.date));
  next.setDate(next.getDate() + 1);
  const nextKey = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, "0")}${String(next.getDate()).padStart(2, "0")}`;
  const start = event.date.replaceAll("-", "");
  const clean = (value: string) =>
    value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Morrow//Event Intelligence//EN",
    "BEGIN:VEVENT", `UID:${event.id}@morrow.local`, `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${nextKey}`, `SUMMARY:${clean(event.title)}`,
    `DESCRIPTION:${clean(`${event.summary}\n\nJRB lens: ${event.jrbAngle}`)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

function downloadEvent(event: DisplayEvent) {
  const blob = new Blob([icsFor(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export function GlobalEventsClient() {
  const [workspaceEvents, setWorkspaceEvents] = useState<WorkspaceEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scope, setScope] = useState<ScopeFilter>("All");
  const [time, setTime] = useState<TimeFilter>("Upcoming");
  const [month, setMonth] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", date: "", category: "Global Observance" as EventCategory,
    relevance: "Medium" as EventRelevance, status: "Idea" as EventStatus,
    contentAngle: "", visualDirection: "", captionDraft: "", notes: "",
  });

  async function loadEvents() {
    try {
      setError("");
      const response = await fetch("/api/events", { cache: "no-store" });
      const data = (await response.json()) as { ok: boolean; events?: WorkspaceEvent[]; message?: string };
      if (!response.ok || !data.ok) throw new Error(data.message || "Could not load event plans.");
      setWorkspaceEvents(data.events ?? []);
    } catch (loadError) {
      console.error("Failed to load event plans:", loadError);
      setError("Saved event plans are temporarily unavailable. The curated calendar is still ready.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  useEffect(() => {
    const requestedEvent = new URLSearchParams(window.location.search).get(
      "event"
    );
    if (requestedEvent) setSelectedId(requestedEvent);
  }, []);

  const catalogue = useMemo<DisplayEvent[]>(() => {
    const planned = new Map(
      workspaceEvents.map((event) => [`${event.title}|${event.date}`.toLowerCase(), event])
    );
    const curated = morrowObservances
      .filter((event) => event.date.startsWith("2026-"))
      .map((event) => {
        const match = planned.get(`${event.title}|${event.date}`.toLowerCase());
        return { ...event, workspaceId: match?.id, workspaceStatus: match?.status };
      });
    const custom = workspaceEvents
      .filter(
        (event) =>
          !morrowObservances.some(
            (item) =>
              item.title.toLowerCase() === event.title.toLowerCase() && item.date === event.date
          )
      )
      .map<DisplayEvent>((event) => ({
        id: `workspace-${event.id}`,
        title: event.title,
        date: event.date,
        scopes: event.category === "Tax & Revenue" ? ["JRB", "Nigeria"] : ["Nigeria"],
        kind: event.category === "Tax & Revenue" ? "Compliance" : "Institutional",
        relevance: event.relevance === "High" ? "Essential" : "Medium",
        verification: "Established",
        emoji: "✦",
        summary: event.contentAngle || event.notes || "A custom moment saved in Morrow.",
        jrbAngle: event.contentAngle || "Define the institutional relevance before publishing.",
        contentCue: event.captionDraft || "Build the content package in the planning studio.",
        visualCue: event.visualDirection || "Set a deliberate visual direction.",
        authority: "Morrow workspace",
        sourceUrl: "",
        workspaceId: event.id,
        workspaceStatus: event.status,
      }));
    return [...curated, ...custom].sort((a, b) => a.date.localeCompare(b.date));
  }, [workspaceEvents]);

  const filtered = useMemo(() => {
    const now = new Date();
    const search = query.trim().toLowerCase();
    return catalogue.filter((event) => {
      if (scope === "Planned" && !event.workspaceId) return false;
      if (scope !== "All" && scope !== "Planned" && !event.scopes.includes(scope)) return false;
      const eventDate = dateAtNoon(event.date);
      if (time === "Upcoming" && daysUntil(event.date) < 0) return false;
      if (
        time === "This month" &&
        (eventDate.getFullYear() !== now.getFullYear() || eventDate.getMonth() !== now.getMonth())
      ) return false;
      if (month !== null && eventDate.getMonth() !== month) return false;
      if (
        search &&
        ![
          event.title, event.summary, event.jrbAngle, event.contentCue,
          event.kind, event.authority, event.scopes.join(" "),
        ].join(" ").toLowerCase().includes(search)
      ) return false;
      return true;
    });
  }, [catalogue, month, query, scope, time]);

  const atlasYear = new Date().getFullYear();
  const atlasMonths = useMemo(
    () =>
      monthNames.map((name, index) => ({
        name,
        index,
        events: catalogue.filter((event) => {
          const eventDate = dateAtNoon(event.date);
          return (
            eventDate.getFullYear() === atlasYear &&
            eventDate.getMonth() === index
          );
        }),
      })),
    [atlasYear, catalogue]
  );
  const horizon = catalogue
    .filter((event) => daysUntil(event.date) >= 0)
    .slice(0, 6);

  const selected =
    catalogue.find((event) => event.id === selectedId) ??
    filtered[0] ??
    catalogue.find((event) => daysUntil(event.date) >= 0) ??
    null;
  const nextEssential =
    catalogue.find((event) => daysUntil(event.date) >= 0 && event.relevance === "Essential") ??
    selected;
  const nextThirty = catalogue.filter((event) => {
    const days = daysUntil(event.date);
    return days >= 0 && days <= 30;
  }).length;
  const nigeriaCount = catalogue.filter((event) => event.scopes.includes("Nigeria")).length;
  const jrbCount = catalogue.filter((event) => event.scopes.includes("JRB")).length;
  const holidayCount = catalogue.filter((event) => event.publicHoliday).length;
  const officialCount = catalogue.filter(
    (event) => event.verification === "Official"
  ).length;

  function focusMonth(monthIndex: number) {
    const nextMonth = month === monthIndex ? null : monthIndex;
    setMonth(nextMonth);
    setTime("All year");
    if (nextMonth !== null) {
      const firstEvent = atlasMonths[nextMonth]?.events[0];
      if (firstEvent) setSelectedId(firstEvent.id);
    }
  }

  async function planEvent(event: DisplayEvent) {
    if (event.workspaceId) {
      setSelectedId(event.id);
      return;
    }
    try {
      setSaving(true);
      setError("");
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event.title,
          date: event.date,
          category: categoryFromObservance(event),
          relevance: relevanceFromObservance(event),
          status: "Idea",
          contentAngle: event.jrbAngle,
          visualDirection: event.visualCue,
          captionDraft: "",
          notes: `${event.summary}\nSource: ${event.authority}${event.sourceUrl ? ` · ${event.sourceUrl}` : ""}`,
        }),
      });
      const data = (await response.json()) as { ok: boolean; event?: WorkspaceEvent; message?: string };
      if (!response.ok || !data.ok || !data.event) throw new Error(data.message || "Could not save event.");
      setWorkspaceEvents((current) => [data.event!, ...current]);
    } catch (saveError) {
      console.error("Failed to plan event:", saveError);
      setError("Morrow could not add that moment to your plan.");
    } finally {
      setSaving(false);
    }
  }

  async function addCustomEvent() {
    if (!form.title.trim() || !form.date) return;
    try {
      setSaving(true);
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { ok: boolean; event?: WorkspaceEvent; message?: string };
      if (!response.ok || !data.ok || !data.event) throw new Error(data.message || "Could not save event.");
      setWorkspaceEvents((current) => [data.event!, ...current]);
      setForm({ title: "", date: "", category: "Global Observance", relevance: "Medium", status: "Idea", contentAngle: "", visualDirection: "", captionDraft: "", notes: "" });
      setStudioOpen(false);
    } catch (saveError) {
      console.error("Failed to add custom event:", saveError);
      setError("That custom event could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function removePlan(event: DisplayEvent) {
    if (!event.workspaceId) return;
    const response = await fetch(`/api/events/${event.workspaceId}`, { method: "DELETE" });
    if (response.ok) {
      setWorkspaceEvents((current) => current.filter((item) => item.id !== event.workspaceId));
    }
  }

  async function copyBrief(event: DisplayEvent) {
    await navigator.clipboard.writeText(
      [
        event.title, formatDate(event.date), event.summary,
        `JRB lens: ${event.jrbAngle}`, `Content cue: ${event.contentCue}`,
        `Visual cue: ${event.visualCue}`, `Source: ${event.authority}`,
      ].join("\n\n")
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="space-y-5" data-testid="event-intelligence">
      {nextEssential ? (
        <section className="relative overflow-hidden rounded-[2.8rem] bg-[#09090d] text-white shadow-[0_40px_120px_rgba(11,11,18,0.24)]">
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_78%_12%,rgba(109,93,252,0.38),transparent_30%),radial-gradient(circle_at_12%_110%,rgba(216,183,106,0.2),transparent_40%)]" />
          <div className="relative grid min-h-[520px] gap-8 p-7 md:p-10 lg:grid-cols-[1fr_0.72fr] lg:p-12">
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/55">
                    Next essential moment
                  </span>
                  {nextEssential.scopes.map((item) => (
                    <span key={item} className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-9 flex items-start gap-5">
                  <span className="text-5xl">{nextEssential.emoji}</span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d8b76a]">
                      {formatDate(nextEssential.date)}
                    </p>
                    <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-7xl">
                      {nextEssential.title}
                    </h2>
                  </div>
                </div>
                <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-white/48">
                  {nextEssential.summary}
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <button onClick={() => void planEvent(nextEssential)} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-extrabold text-[#17171b] transition hover:-translate-y-0.5">
                  {nextEssential.workspaceId ? <Check size={16} /> : <CalendarPlus size={16} />}
                  {nextEssential.workspaceId ? "In Morrow plan" : "Plan this moment"}
                </button>
                <button onClick={() => downloadEvent(nextEssential)} className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white">
                  Add to calendar <ArrowRight size={15} />
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <div className="w-full rounded-[2.2rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur-2xl">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/35">Live countdown</p>
                <p className="mt-4 text-6xl font-semibold tracking-[-0.06em]">{Math.max(0, daysUntil(nextEssential.date))}</p>
                <p className="mt-1 text-sm font-bold text-white/42">{countdown(nextEssential.date)}</p>
                <div className="my-6 h-px bg-white/10" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d8b76a]">JRB relevance</p>
                <p className="mt-3 text-sm font-semibold leading-7 text-white/58">{nextEssential.jrbAngle}</p>
                <div className="mt-6 flex items-center justify-between gap-3 text-xs font-bold text-white/34">
                  <span>{nextEssential.verification}</span>
                  <span>{nextEssential.authority}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Globe2} value={catalogue.length} label="Curated moments" detail="Across the year" />
        <Metric icon={Flag} value={nigeriaCount} label="Nigeria relevant" detail="National + cultural" />
        <Metric icon={Landmark} value={jrbCount} label="JRB opportunities" detail="Service + compliance" />
        <Metric icon={Sparkles} value={nextThirty} label="Next 30 days" detail="Prepare ahead" />
      </section>

      <section
        id="event-atlas"
        className="overflow-hidden rounded-[1.8rem] border border-black/[0.06] bg-[#f5f3ed] shadow-[0_24px_80px_rgba(23,23,27,0.08)]"
      >
        <div className="relative overflow-hidden bg-[#101016] px-6 py-8 text-white md:px-9 md:py-10">
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_12%_0%,rgba(109,93,252,0.32),transparent_34%),radial-gradient(circle_at_90%_120%,rgba(216,183,106,0.2),transparent_38%)]" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/48">
                <CalendarDays size={13} className="text-[#d8b76a]" />
                {atlasYear} calendar
              </div>
              <h2 className="mt-6 text-3xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-4xl md:text-5xl">
                Plan the year
              </h2>
              <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-white/44">
                Review sourced observances, public holidays, Nigerian events,
                JRB deadlines, and institutional dates in one calendar.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[440px]">
              <AtlasMetric value={officialCount} label="Official" />
              <AtlasMetric value={holidayCount} label="Holidays" />
              <AtlasMetric value={jrbCount} label="JRB dates" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 md:p-6 xl:grid-cols-[1fr_340px] xl:p-7">
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {atlasMonths.map((atlasMonth) => (
                <MonthAtlasCard
                  key={atlasMonth.name}
                  year={atlasYear}
                  month={atlasMonth.index}
                  events={atlasMonth.events}
                  focused={month === atlasMonth.index}
                  onFocus={() => focusMonth(atlasMonth.index)}
                  onSelect={(event) => setSelectedId(event.id)}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-black/[0.055] bg-white/55 px-4 py-3">
              <AtlasLegend tone="bg-[#d8b76a]" label="Public holiday" />
              <AtlasLegend tone="bg-[#6d5dfc]" label="JRB / compliance" />
              <AtlasLegend tone="bg-emerald-500" label="Nigeria" />
              <AtlasLegend tone="bg-sky-500" label="World" />
              <p className="ml-auto text-[10px] font-bold text-slate-400">
                Select a month to focus the directory below.
              </p>
            </div>
          </div>

          <aside className="overflow-hidden rounded-[2.1rem] bg-white/80 shadow-[0_20px_70px_rgba(23,23,27,0.08)]">
            <div className="border-b border-black/[0.055] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6d5dfc]">
                    Upcoming events
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    Next on the calendar
                  </h3>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efefff] text-[#6254e8]">
                  <Clock3 size={18} />
                </span>
              </div>
            </div>
            <div className="divide-y divide-black/[0.055]">
              {horizon.length > 0 ? (
                horizon.map((event, index) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedId(event.id)}
                    className="group flex w-full items-start gap-3 p-4 text-left transition hover:bg-[#f7f5ef]"
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                        index === 0
                          ? "bg-[#17171b] text-white"
                          : "bg-[#efefff] text-[#6254e8]"
                      }`}
                    >
                      {dateAtNoon(event.date).getDate()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                        {formatDate(event.date, true)} · {countdown(event.date)}
                      </span>
                      <span className="mt-1 block text-sm font-extrabold leading-5 text-[#17171b]">
                        {event.title}
                      </span>
                      <span className="mt-1 block text-[10px] font-bold text-slate-400">
                        {event.scopes.join(" · ")}
                      </span>
                    </span>
                    <ArrowRight
                      size={14}
                      className="mt-2 shrink-0 text-slate-200 transition group-hover:translate-x-0.5 group-hover:text-[#6254e8]"
                    />
                  </button>
                ))
              ) : (
                <div className="p-6 text-sm font-semibold leading-7 text-slate-400">
                  No later events match the current filters. Switch to All year
                  to review the full calendar.
                </div>
              )}
            </div>
            <div className="m-4 rounded-[1.4rem] bg-[#17171b] p-4 text-white">
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d8b76a]">
                <Layers3 size={13} />
                One calendar, four lenses
              </div>
              <p className="mt-3 text-xs font-semibold leading-6 text-white/48">
                World culture, Nigerian public life, JRB relevance, and
                compliance dates remain distinct—never flattened into generic
                “content days.”
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="devon-v2-glass rounded-[2.4rem] p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {scopeFilters.map((item) => (
              <button key={item} onClick={() => setScope(item)} className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${scope === item ? "bg-[#17171b] text-white shadow-lg" : "bg-white/70 text-slate-500 hover:text-[#17171b]"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any moment…" className="h-11 w-full rounded-2xl border border-black/[0.07] bg-white/75 pl-10 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#6d5dfc]/10 sm:w-64" />
            </div>
            <select value={time} onChange={(event) => setTime(event.target.value as TimeFilter)} className="h-11 rounded-2xl border border-black/[0.07] bg-white/75 px-4 text-xs font-extrabold outline-none">
              {timeFilters.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button onClick={() => setStudioOpen((value) => !value)} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#6d5dfc] px-4 text-xs font-extrabold text-white">
              <Plus size={15} /> Add event
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-auto pb-1">
          <button onClick={() => setMonth(null)} className={`shrink-0 rounded-xl px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] ${month === null ? "bg-[#efefff] text-[#6254e8]" : "text-slate-400"}`}>All months</button>
          {months.map((item, index) => (
            <button key={item} onClick={() => setMonth(index)} className={`shrink-0 rounded-xl px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] ${month === index ? "bg-[#efefff] text-[#6254e8]" : "text-slate-400"}`}>{item}</button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {studioOpen ? (
          <motion.section initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="devon-v2-glass rounded-[2.4rem] p-5 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6d5dfc]">Custom event</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Add an event</h3></div>
              <button onClick={() => setStudioOpen(false)} className="text-xs font-bold text-slate-400">Close</button>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Moment title" className="devon-settings-input md:col-span-2" />
              <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="devon-settings-input" />
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as EventCategory })} className="devon-settings-input">
                {["Global Observance", "National Day", "Internal Event", "Tax & Revenue", "Public Service", "Media & Communication", "Custom"].map((item) => <option key={item}>{item}</option>)}
              </select>
              <textarea value={form.contentAngle} onChange={(event) => setForm({ ...form, contentAngle: event.target.value })} placeholder="Why this moment matters" rows={3} className="devon-settings-input resize-none md:col-span-2" />
              <textarea value={form.visualDirection} onChange={(event) => setForm({ ...form, visualDirection: event.target.value })} placeholder="Visual direction" rows={3} className="devon-settings-input resize-none md:col-span-2" />
            </div>
            <button disabled={saving || !form.title || !form.date} onClick={() => void addCustomEvent()} className="mt-4 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#17171b] px-5 text-sm font-extrabold text-white disabled:opacity-40">
              {saving ? <MorrowInlineLoader label="Saving moment" /> : <><Plus size={15} /> Save to Morrow</>}
            </button>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {error ? <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="devon-v2-glass rounded-[2.4rem] p-5 md:p-6">
          <div className="flex items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6d5dfc]">Event directory</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{filtered.length} events</h2></div>
            <button onClick={() => void loadEvents()} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-400"><RefreshCcw size={14} /> Refresh</button>
          </div>
          {!loaded ? (
            <div className="py-16"><MorrowInlineLoader label="Opening the world calendar" /></div>
          ) : (
            <div className="devon-scrollbar mt-4 max-h-[850px] space-y-2 overflow-auto pr-1">
              {filtered.map((event) => (
                <button key={event.id} onClick={() => setSelectedId(event.id)} className={`w-full rounded-[1.65rem] border p-4 text-left transition ${selected?.id === event.id ? "border-[#6d5dfc]/22 bg-[#efefff]/75 shadow-[0_18px_55px_rgba(109,93,252,0.08)]" : "border-black/[0.06] bg-white/60 hover:bg-white"}`}>
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#17171b] text-lg text-white">{event.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6d5dfc]">{formatDate(event.date, true)}</span>
                        <span className="text-[10px] font-bold text-slate-300">· {countdown(event.date)}</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-extrabold tracking-[-0.02em] text-[#17171b]">{event.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-400">{event.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {event.scopes.map((item) => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-500">{item}</span>)}
                        <span className="rounded-full bg-[#f5eddb] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#806126]">{event.verification}</span>
                        {event.workspaceId ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-emerald-700">Planned</span> : null}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="xl:sticky xl:top-[92px] xl:self-start">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2.4rem] border border-black/[0.06] bg-[#f8f7f2] shadow-[0_30px_90px_rgba(23,23,27,0.12)]">
              <div className="bg-[#17171b] p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-4xl">{selected.emoji}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/60">{selected.kind}</span>
                </div>
                <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d8b76a]">{formatDate(selected.date)} · {countdown(selected.date)}</p>
                <h2 className="mt-3 text-4xl font-semibold leading-[0.98] tracking-[-0.05em]">{selected.title}</h2>
                <p className="mt-4 text-sm font-semibold leading-7 text-white/48">{selected.summary}</p>
              </div>
              <div className="space-y-5 p-6">
                <Insight label="JRB lens" value={selected.jrbAngle} />
                <Insight label="Content cue" value={selected.contentCue} />
                <Insight label="Visual direction" value={selected.visualCue} />
                <div className="rounded-2xl border border-black/[0.06] bg-white/65 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400"><ShieldCheck size={14} /> Source confidence</div>
                  <p className="mt-2 text-sm font-bold text-[#17171b]">{selected.verification} · {selected.authority}</p>
                  {selected.verification === "Expected" ? <p className="mt-2 text-xs font-semibold leading-5 text-amber-700">Confirm the official Nigerian declaration before publishing or closing offices.</p> : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button onClick={() => void copyBrief(selected)} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/[0.07] bg-white text-sm font-extrabold"><Copy size={15} /> {copied ? "Copied" : "Copy brief"}</button>
                  <button onClick={() => downloadEvent(selected)} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#17171b] text-sm font-extrabold text-white"><CalendarPlus size={15} /> Add to calendar</button>
                  <button disabled={saving} onClick={() => void planEvent(selected)} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#6d5dfc] text-sm font-extrabold text-white sm:col-span-2">
                    {selected.workspaceId ? <Check size={15} /> : <Plus size={15} />}{selected.workspaceId ? `Planned · ${selected.workspaceStatus}` : "Add to Morrow plan"}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {selected.sourceUrl ? <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-extrabold text-[#6d5dfc]">Open official source <ExternalLink size={13} /></a> : <span />}
                  {selected.workspaceId ? <button onClick={() => void removePlan(selected)} aria-label="Remove saved event plan" className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button> : null}
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, value, label, detail }: { icon: typeof Globe2; value: number; label: string; detail: string }) {
  return <div className="devon-v2-glass rounded-[1.8rem] p-5"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#efefff] text-[#6254e8]"><Icon size={17} /></span><span className="text-3xl font-semibold tracking-[-0.05em]">{value}</span></div><p className="mt-5 text-sm font-extrabold">{label}</p><p className="mt-1 text-xs font-semibold text-slate-400">{detail}</p></div>;
}

function Insight({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6d5dfc]">{label}</p><p className="mt-2 text-sm font-semibold leading-7 text-slate-600">{value}</p></div>;
}

function AtlasMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.065] px-4 py-4 backdrop-blur-xl">
      <p className="text-3xl font-semibold tracking-[-0.055em]">{value}</p>
      <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-white/35">
        {label}
      </p>
    </div>
  );
}

function AtlasLegend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-extrabold text-slate-500">
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      {label}
    </span>
  );
}

function MonthAtlasCard({
  year,
  month,
  events,
  focused,
  onFocus,
  onSelect,
}: {
  year: number;
  month: number;
  events: DisplayEvent[];
  focused: boolean;
  onFocus: () => void;
  onSelect: (event: DisplayEvent) => void;
}) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventsByDay = new Map<number, DisplayEvent[]>();

  for (const event of events) {
    const day = dateAtNoon(event.date).getDate();
    eventsByDay.set(day, [...(eventsByDay.get(day) ?? []), event]);
  }

  return (
    <article
      className={`rounded-[1.65rem] border p-4 transition duration-300 ${
        focused
          ? "border-[#6d5dfc]/35 bg-white shadow-[0_22px_65px_rgba(109,93,252,0.14)]"
          : "border-black/[0.055] bg-white/62 hover:-translate-y-0.5 hover:bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onFocus}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-label={`Focus ${monthNames[month]} ${year}, ${events.length} events`}
      >
        <span>
          <span className="block text-[9px] font-extrabold uppercase tracking-[0.17em] text-slate-400">
            {year}
          </span>
          <span className="mt-1 block text-lg font-extrabold tracking-[-0.03em] text-[#17171b]">
            {monthNames[month]}
          </span>
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${
            focused
              ? "bg-[#6d5dfc] text-white"
              : "bg-[#efefff] text-[#6254e8]"
          }`}
        >
          {events.length} {events.length === 1 ? "moment" : "moments"}
        </span>
      </button>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {weekdayInitials.map((weekday, index) => (
          <span
            key={`${weekday}-${index}`}
            className="pb-1 text-[8px] font-extrabold text-slate-300"
          >
            {weekday}
          </span>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayEvents = eventsByDay.get(day) ?? [];
          const primary = dayEvents[0];
          const tone = primary?.publicHoliday
            ? "bg-[#d8b76a] text-[#17171b]"
            : primary?.kind === "Compliance" || primary?.scopes.includes("JRB")
              ? "bg-[#6d5dfc] text-white"
              : primary?.scopes.includes("Nigeria")
                ? "bg-emerald-500 text-white"
                : primary
                  ? "bg-sky-500 text-white"
                  : "text-slate-300";

          return (
            <button
              key={day}
              type="button"
              disabled={!primary}
              onClick={() => primary && onSelect(primary)}
              title={
                dayEvents.length
                  ? dayEvents.map((event) => event.title).join(" · ")
                  : undefined
              }
              aria-label={
                dayEvents.length
                  ? `${monthNames[month]} ${day}: ${dayEvents
                      .map((event) => event.title)
                      .join(", ")}`
                  : `${monthNames[month]} ${day}`
              }
              className={`relative flex aspect-square items-center justify-center rounded-lg text-[8px] font-extrabold transition ${tone} ${
                primary
                  ? "shadow-sm hover:scale-110 hover:shadow-md"
                  : "cursor-default"
              }`}
            >
              {day}
              {dayEvents.length > 1 ? (
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full border border-white bg-[#17171b]" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-[44px] space-y-1.5">
        {events.slice(0, 2).map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event)}
            className="flex w-full items-center gap-2 text-left text-[9px] font-bold text-slate-500 transition hover:text-[#6254e8]"
          >
            <span className="w-5 shrink-0 text-[#6254e8]">
              {String(dateAtNoon(event.date).getDate()).padStart(2, "0")}
            </span>
            <span className="truncate">{event.title}</span>
          </button>
        ))}
        {events.length > 2 ? (
          <button
            type="button"
            onClick={onFocus}
            className="text-[9px] font-extrabold text-slate-300 transition hover:text-[#6254e8]"
          >
            + {events.length - 2} more in the directory
          </button>
        ) : null}
      </div>
    </article>
  );
}
