"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Globe2,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

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

type GlobalEvent = {
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
};

type EventForm = Omit<GlobalEvent, "id" | "createdAt">;

const STORAGE_KEY = "devonos.global-events.v1";

const categories: EventCategory[] = [
  "Global Observance",
  "National Day",
  "Internal Event",
  "Tax & Revenue",
  "Public Service",
  "Media & Communication",
  "Custom",
];

const relevanceOptions: EventRelevance[] = ["High", "Medium", "Low"];

const statusOptions: EventStatus[] = [
  "Idea",
  "Drafting",
  "Approved",
  "Posted",
  "Skipped",
];

const starterEvents: GlobalEvent[] = [
  {
    id: "starter-womens-day",
    title: "International Women’s Day",
    date: "2026-03-08",
    category: "Global Observance",
    relevance: "High",
    status: "Idea",
    contentAngle:
      "Celebrate women’s contributions to leadership, public service, policy, communication, and national development.",
    visualDirection:
      "Premium white editorial layout with elegant portraits, soft typography, and refined institutional tone.",
    captionDraft:
      "Today, we celebrate the strength, leadership, and contributions of women across public service, governance, and national development. Happy International Women’s Day.",
    notes: "Good for institutional social media content.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-health-day",
    title: "World Health Day",
    date: "2026-04-07",
    category: "Global Observance",
    relevance: "Medium",
    status: "Idea",
    contentAngle:
      "Connect health, wellbeing, public service productivity, and responsible institutions.",
    visualDirection:
      "Clean white health-themed graphic with soft blue accents and calm official composition.",
    captionDraft:
      "Health remains essential to productivity, public service, and national progress. Today, we join the global community in commemorating World Health Day.",
    notes: "Useful if department wants broader public awareness posts.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-pr-day",
    title: "World Public Relations Day",
    date: "2026-07-16",
    category: "Media & Communication",
    relevance: "High",
    status: "Idea",
    contentAngle:
      "Highlight the role of strategic communication, public trust, clarity, and institutional reputation.",
    visualDirection:
      "Luxury communication-themed design with microphone, speech elements, subtle glass panels, and strong negative space.",
    captionDraft:
      "Strategic communication remains central to trust, clarity, and effective public engagement. Today, we celebrate the value of public relations in strengthening institutions.",
    notes: "Very relevant for communications department.",
    createdAt: new Date().toISOString(),
  },
];

const emptyForm: EventForm = {
  title: "",
  date: "",
  category: "Global Observance",
  relevance: "High",
  status: "Idea",
  contentAngle: "",
  visualDirection: "",
  captionDraft: "",
  notes: "",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDaysUntil(dateString: string) {
  if (!dateString) return 999999;

  const today = todayStart();
  const eventDate = new Date(dateString);
  eventDate.setHours(0, 0, 0, 0);

  const diff = eventDate.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string) {
  if (!dateString) return "No date";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function dateStatus(dateString: string) {
  const days = getDaysUntil(dateString);

  if (days === 999999) return "No date";
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${days} days`;
  return `In ${days} days`;
}

function relevanceClass(relevance: EventRelevance) {
  if (relevance === "High") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (relevance === "Medium") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function statusClass(status: EventStatus) {
  if (status === "Posted") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "Approved") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Drafting") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (status === "Skipped") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-slate-200 bg-white text-slate-500";
}

function buildSuggestedCaption(event: GlobalEvent | null) {
  if (!event) return "Select an event to generate a content direction.";

  const lines: string[] = [];

  lines.push(`${event.title}`);
  lines.push("");
  lines.push(event.captionDraft || "Caption draft has not been added yet.");
  lines.push("");

  if (event.contentAngle) {
    lines.push(`Content Angle: ${event.contentAngle}`);
  }

  if (event.visualDirection) {
    lines.push(`Visual Direction: ${event.visualDirection}`);
  }

  if (event.notes) {
    lines.push(`Notes: ${event.notes}`);
  }

  return lines.join("\n");
}

export function GlobalEventsClient() {
  const [events, setEvents] = useState<GlobalEvent[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setEvents(JSON.parse(stored));
      } else {
        setEvents(starterEvents);
      }
    } catch {
      setEvents(starterEvents);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aDays = getDaysUntil(a.date);
      const bDays = getDaysUntil(b.date);

      if (aDays < 0 && bDays >= 0) return 1;
      if (bDays < 0 && aDays >= 0) return -1;

      return aDays - bDays;
    });
  }, [events]);

  const filteredEvents = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return sortedEvents;

    return sortedEvents.filter((event) =>
      [
        event.title,
        event.category,
        event.relevance,
        event.status,
        event.contentAngle,
        event.visualDirection,
        event.captionDraft,
        event.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query, sortedEvents]);

  const selectedEvent = useMemo(() => {
    if (!selectedId) return sortedEvents[0] ?? null;
    return events.find((event) => event.id === selectedId) ?? null;
  }, [events, selectedId, sortedEvents]);

  const upcomingEvents = useMemo(() => {
    return events.filter((event) => {
      const days = getDaysUntil(event.date);
      return days >= 0 && days <= 30;
    });
  }, [events]);

  const highRelevance = events.filter(
    (event) => event.relevance === "High"
  ).length;

  const readyOrPosted = events.filter(
    (event) => event.status === "Approved" || event.status === "Posted"
  ).length;

  const suggestedContent = buildSuggestedCaption(selectedEvent);

  function addEvent() {
    if (!form.title.trim()) return;

    const newEvent: GlobalEvent = {
      ...form,
      id: makeId(),
      title: form.title.trim(),
      contentAngle: form.contentAngle.trim(),
      visualDirection: form.visualDirection.trim(),
      captionDraft: form.captionDraft.trim(),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setEvents((current) => [newEvent, ...current]);
    setSelectedId(newEvent.id);
    setForm(emptyForm);
  }

  function removeEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id));

    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function updateStatus(id: string, status: EventStatus) {
    setEvents((current) =>
      current.map((event) => (event.id === id ? { ...event, status } : event))
    );
  }

  async function copyContent() {
    await navigator.clipboard.writeText(suggestedContent);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <CalendarDays size={14} className="text-[#5B5DF5]" />
                Event Planner
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add an observance or event
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Store notable days, internal events, and communication
                opportunities before they surprise you.
              </p>
            </div>

            <button
              onClick={addEvent}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              <Plus size={16} />
              Save Event
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Event Name
              </span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. World Public Relations Day"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Date
              </span>
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Category
              </span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as EventCategory,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Relevance
              </span>
              <select
                value={form.relevance}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    relevance: event.target.value as EventRelevance,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {relevanceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as EventStatus,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Content Angle
              </span>
              <textarea
                value={form.contentAngle}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contentAngle: event.target.value,
                  }))
                }
                placeholder="What should the content say or focus on?"
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Visual Direction
              </span>
              <textarea
                value={form.visualDirection}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    visualDirection: event.target.value,
                  }))
                }
                placeholder="Describe the design direction for this event."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Caption Draft
              </span>
              <textarea
                value={form.captionDraft}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    captionDraft: event.target.value,
                  }))
                }
                placeholder="Draft the caption or message for this event."
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Notes
              </span>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Add any reminders, approvals, or special instructions."
                rows={3}
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
                Event Radar
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Upcoming communication opportunities
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-3xl font-semibold">{events.length}</p>
              <p className="mt-1 text-xs text-white/38">Events</p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-3xl font-semibold">{upcomingEvents.length}</p>
              <p className="mt-1 text-xs text-white/38">30 days</p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-3xl font-semibold">{highRelevance}</p>
              <p className="mt-1 text-xs text-white/38">High relevance</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              Planning note
            </p>

            <p className="mt-3 text-sm leading-6 text-white/62">
              Prioritize high-relevance events first. Build captions and visual
              direction early so designs are ready before the day arrives.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard
            title="Total Events"
            value={events.length}
            sub="Saved dates"
            icon={Globe2}
          />
          <MetricCard
            title="Upcoming"
            value={upcomingEvents.length}
            sub="Next 30 days"
            icon={Clock}
          />
          <MetricCard
            title="Ready"
            value={readyOrPosted}
            sub="Approved / posted"
            icon={CheckCircle2}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Events Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search and manage important dates.
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
                placeholder="Search events..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <CalendarDays size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No events yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add an observance or internal event to begin planning.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const isSelected = selectedEvent?.id === event.id;

                return (
                  <div
                    key={event.id}
                    className={`rounded-[1.65rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                      isSelected
                        ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                        : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                    }`}
                  >
                    <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <button
                        onClick={() => setSelectedId(event.id)}
                        className="flex-1 text-left"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5B5DF5]">
                          {event.category}
                        </p>

                        <h3 className="mt-2 text-base font-semibold text-[#0B0D12]">
                          {event.title}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-slate-400">
                          {formatDate(event.date)} · {dateStatus(event.date)}
                        </p>
                      </button>

                      <button
                        onClick={() => removeEvent(event.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                        aria-label="Remove event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${relevanceClass(
                          event.relevance
                        )}`}
                      >
                        {event.relevance} relevance
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    {event.contentAngle ? (
                      <p className="text-sm leading-6 text-slate-500">
                        {event.contentAngle}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(event.id, status)}
                          className="rounded-full border border-slate-950/[0.08] bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-[#0B0D12]"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#8A6B22]">
              <Lightbulb size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Content Direction
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select an event and copy its planning note.
              </p>
            </div>
          </div>

          {selectedEvent ? (
            <div className="mb-4 rounded-[1.55rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Selected event
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#0B0D12]">
                {selectedEvent.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {formatDate(selectedEvent.date)} · {selectedEvent.category}
              </p>
            </div>
          ) : null}

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {suggestedContent}
            </pre>
          </div>

          <button
            onClick={copyContent}
            disabled={!selectedEvent}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy Content Direction"}
          </button>
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