"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Globe2,
  Plus,
  RefreshCcw,
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
  updatedAt: string;
};

type EventForm = {
  title: string;
  date: string;
  category: EventCategory;
  relevance: EventRelevance;
  status: EventStatus;
  contentAngle: string;
  visualDirection: string;
  captionDraft: string;
  notes: string;
};

type EventsApiResponse = {
  ok: boolean;
  events?: GlobalEvent[];
  event?: GlobalEvent;
  message?: string;
};

const categories: EventCategory[] = [
  "Global Observance",
  "National Day",
  "Internal Event",
  "Tax & Revenue",
  "Public Service",
  "Media & Communication",
  "Custom",
];

const relevances: EventRelevance[] = ["High", "Medium", "Low"];

const statuses: EventStatus[] = [
  "Idea",
  "Drafting",
  "Approved",
  "Posted",
  "Skipped",
];

const emptyForm: EventForm = {
  title: "",
  date: "",
  category: "Global Observance",
  relevance: "Medium",
  status: "Idea",
  contentAngle: "",
  visualDirection: "",
  captionDraft: "",
  notes: "",
};

function normalizeEvent(item: Partial<GlobalEvent>): GlobalEvent {
  return {
    id: item.id ?? "",
    title: item.title ?? "",
    date: item.date ?? "",
    category: (item.category ?? "Global Observance") as EventCategory,
    relevance: (item.relevance ?? "Medium") as EventRelevance,
    status: (item.status ?? "Idea") as EventStatus,
    contentAngle: item.contentAngle ?? "",
    visualDirection: item.visualDirection ?? "",
    captionDraft: item.captionDraft ?? "",
    notes: item.notes ?? "",
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
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

  if (Number.isNaN(date.getTime())) return "No date";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function dateStatus(dateString: string) {
  const days = getDaysUntil(dateString);

  if (days === 999999) return "No date";
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function relevanceClass(relevance: EventRelevance) {
  if (relevance === "High") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (relevance === "Medium") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function statusClass(status: EventStatus) {
  if (status === "Posted") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "Approved" || status === "Drafting") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Skipped") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
}

function categoryClass(category: EventCategory) {
  if (category === "Tax & Revenue") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (category === "Media & Communication") {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (category === "National Day") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (category === "Internal Event") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  return "border-slate-200 bg-white text-slate-500";
}

function buildSuggestedCaption(event: GlobalEvent | null) {
  if (!event) return "Select an event to preview its content package.";

  return [
    event.title,
    "",
    `Date: ${formatDate(event.date)} (${dateStatus(event.date)})`,
    `Category: ${event.category}`,
    `Relevance: ${event.relevance}`,
    `Status: ${event.status}`,
    "",
    "Content Angle:",
    event.contentAngle || "No content angle added.",
    "",
    "Visual Direction:",
    event.visualDirection || "No visual direction added.",
    "",
    "Caption Draft:",
    event.captionDraft || "No caption draft added.",
    "",
    "Notes:",
    event.notes || "No notes added.",
  ].join("\n");
}

export function GlobalEventsClient() {
  const [events, setEvents] = useState<GlobalEvent[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadEvents() {
    try {
      setErrorMessage("");

      const response = await fetch("/api/events", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load events.");
      }

      const data = (await response.json()) as EventsApiResponse;

      if (!data.ok || !data.events) {
        throw new Error(data.message || "Events response was invalid.");
      }

      const nextEvents = data.events.map(normalizeEvent);

      setEvents(nextEvents);

      if (!selectedId) {
        setSelectedId(nextEvents[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
      setErrorMessage("Events could not be loaded from the database.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return events;

    return events.filter((event) =>
      [
        event.title,
        event.date,
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
  }, [events, query]);

  const selectedEvent = useMemo(() => {
    if (!selectedId) return filteredEvents[0] ?? null;

    return (
      events.find((event) => event.id === selectedId) ??
      filteredEvents[0] ??
      null
    );
  }, [events, filteredEvents, selectedId]);

  const upcomingEvents = events.filter((event) => {
    const days = getDaysUntil(event.date);
    return days >= 0 && days <= 30;
  }).length;

  const todayEvents = events.filter((event) => getDaysUntil(event.date) === 0).length;

  const pastEvents = events.filter((event) => getDaysUntil(event.date) < 0).length;

  const highRelevanceEvents = events.filter(
    (event) => event.relevance === "High"
  ).length;

  const approvedEvents = events.filter(
    (event) => event.status === "Approved" || event.status === "Posted"
  ).length;

  const exportText = buildSuggestedCaption(selectedEvent);

  function updateForm<Key extends keyof EventForm>(
    key: Key,
    value: EventForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrorMessage("");
  }

  async function addEvent() {
    if (!form.title.trim()) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create event.");
      }

      const data = (await response.json()) as EventsApiResponse;

      if (!data.ok || !data.event) {
        throw new Error(data.message || "Events response was invalid.");
      }

      const newEvent = normalizeEvent(data.event);

      setEvents((current) => [newEvent, ...current]);
      setSelectedId(newEvent.id);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to create event:", error);
      setErrorMessage("Event could not be saved to the database.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: EventStatus) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update event.");
      }

      const data = (await response.json()) as EventsApiResponse;

      if (!data.ok || !data.event) {
        throw new Error(data.message || "Events response was invalid.");
      }

      const updatedEvent = normalizeEvent(data.event);

      setEvents((current) =>
        current.map((event) => (event.id === id ? updatedEvent : event))
      );
    } catch (error) {
      console.error("Failed to update event:", error);
      setErrorMessage("Event status could not be updated.");
    }
  }

  async function removeEvent(id: string) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event.");
      }

      setEvents((current) => current.filter((event) => event.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      setErrorMessage("Event could not be deleted.");
    }
  }

  async function copyEvent() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Globe2 size={14} className="text-[#5B5DF5]" />
                Event Intelligence
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add an event signal
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Save observance days, public communication opportunities,
                internal events, content angles, and visual directions directly
                into your Prisma database.
              </p>
            </div>

            <button
              onClick={addEvent}
              disabled={saving || !loaded}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? "Saving..." : "Save Event"}
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
                Event Title
              </span>
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
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
                onChange={(event) => updateForm("date", event.target.value)}
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
                  updateForm("category", event.target.value as EventCategory)
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
                  updateForm("relevance", event.target.value as EventRelevance)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {relevances.map((relevance) => (
                  <option key={relevance}>{relevance}</option>
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
                  updateForm("status", event.target.value as EventStatus)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
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
                  updateForm("contentAngle", event.target.value)
                }
                placeholder="What should the communication focus on?"
                rows={4}
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
                  updateForm("visualDirection", event.target.value)
                }
                placeholder="Describe the design style, scene, poster idea, or video direction..."
                rows={4}
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
                  updateForm("captionDraft", event.target.value)
                }
                placeholder="Draft the post caption or announcement here..."
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
                placeholder="Approval notes, timing, reminders, source ideas, or internal context..."
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
                {events.length} database events
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <DarkMetric value={todayEvents} label="Today" />
            <DarkMetric value={upcomingEvents} label="30 Days" />
            <DarkMetric value={highRelevanceEvents} label="High" />
            <DarkMetric value={approvedEvents} label="Ready" />
          </div>

          <button
            onClick={loadEvents}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh Event Data
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Events"
            value={events.length}
            sub="Database records"
            icon={Globe2}
          />
          <MetricCard
            title="Upcoming"
            value={upcomingEvents}
            sub="Next 30 days"
            icon={CalendarDays}
          />
          <MetricCard
            title="High Relevance"
            value={highRelevanceEvents}
            sub="Priority moments"
            icon={Sparkles}
          />
          <MetricCard
            title="Past"
            value={pastEvents}
            sub="Needs archive/review"
            icon={Clock}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Event Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, preview, update, and delete database-backed event
                records.
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

          {!loaded ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <RefreshCcw size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                Loading events
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fetching records from the database.
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <Globe2 size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No event records found
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add your first event to begin building the content calendar.
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
                        className="flex flex-1 gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                          <CalendarDays size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {event.title}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {formatDate(event.date)} · {dateStatus(event.date)}
                          </p>
                        </div>
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
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryClass(
                          event.category
                        )}`}
                      >
                        {event.category}
                      </span>

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
                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {event.contentAngle}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {statuses.map((status) => (
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
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Content Direction
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select an event and copy its content package.
              </p>
            </div>

            <button
              onClick={copyEvent}
              disabled={!selectedEvent}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Event"}
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

function DarkMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-white/38">{label}</p>
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
