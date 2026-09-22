"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  Newspaper,
  Play,
  RefreshCcw,
  Smartphone,
} from "lucide-react";

type AutomationSchedule = {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  cadence: string;
  time: string;
  timezone: string;
  channels: string;
  lastRunAt: string | null;
  lastStatus: string;
  lastSummary: string;
};

type AutomationRun = {
  id: string;
  trigger: string;
  status: string;
  summary: string;
  outputHref: string;
  recordsCreated: number;
  error: string;
  startedAt: string;
  completedAt: string | null;
};

type AutomationResponse = {
  ok: boolean;
  message?: string;
  schedule?: AutomationSchedule;
  runs?: AutomationRun[];
  nextRunAt?: string | null;
};

type AlertPreviewResponse = {
  ok: boolean;
  counts?: {
    active: number;
    critical: number;
    warning: number;
    categories: Record<string, number>;
  };
};

const NOTIFICATIONS_CHANGED_EVENT = "devonos:notifications-changed";

function formatDateTime(value: string | null | undefined, timeZone?: string) {
  if (!value) return "Not run yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not run yet";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

function runStatusClass(status: string) {
  if (status === "Failed") return "border-red-100 bg-red-50 text-red-600";
  if (status === "Completed with warnings") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  if (status === "Running") return "border-blue-100 bg-blue-50 text-blue-600";
  return "border-cyan-100 bg-cyan-50 text-cyan-700";
}

export function AutomationControlClient() {
  const [schedule, setSchedule] = useState<AutomationSchedule | null>(null);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [nextRunAt, setNextRunAt] = useState<string | null>(null);
  const [alertCounts, setAlertCounts] = useState({
    active: 0,
    critical: 0,
    warning: 0,
    categories: {} as Record<string, number>,
  });
  const [time, setTime] = useState("07:30");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadAutomation = useCallback(async () => {
    try {
      setErrorMessage("");
      const [response, alertResponse] = await Promise.all([
        fetch("/api/automations", {
          method: "GET",
          cache: "no-store",
        }),
        fetch("/api/alerts/scan", {
          method: "GET",
          cache: "no-store",
        }),
      ]);
      const data = (await response.json()) as AutomationResponse;
      const alertData = (await alertResponse.json()) as AlertPreviewResponse;

      if (!response.ok || !data.ok || !data.schedule) {
        throw new Error(data.message || "Automation controls did not load.");
      }

      setSchedule(data.schedule);
      setTime(data.schedule.time);
      setRuns(data.runs ?? []);
      setNextRunAt(data.nextRunAt ?? null);
      if (alertResponse.ok && alertData.ok && alertData.counts) {
        setAlertCounts(alertData.counts);
      }
    } catch (error) {
      console.error("Failed to load automation controls:", error);
      setErrorMessage("Automation controls could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAutomation();
  }, [loadAutomation]);

  async function saveSchedule(input: {
    enabled?: boolean;
    time?: string;
  }) {
    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");
      const response = await fetch("/api/automations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as AutomationResponse;

      if (!response.ok || !data.ok || !data.schedule) {
        throw new Error(data.message || "The schedule could not be saved.");
      }

      setSchedule(data.schedule);
      setTime(data.schedule.time);
      setNextRunAt(data.nextRunAt ?? null);
      setMessage(
        data.schedule.enabled
          ? `Daily command sweep set for ${data.schedule.time} ${data.schedule.timezone}.`
          : "The daily schedule is paused."
      );
    } catch (error) {
      console.error("Failed to save automation schedule:", error);
      setErrorMessage("The daily schedule could not be saved.");
      await loadAutomation();
    } finally {
      setSaving(false);
    }
  }

  async function runNow() {
    try {
      setRunning(true);
      setMessage("");
      setErrorMessage("");
      const response = await fetch(
        "/api/automations/daily-intelligence",
        {
          method: "POST",
        }
      );
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        summary?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message || "The daily command sweep did not complete."
        );
      }

      setMessage(data.summary || "The daily command sweep is complete.");
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
      await loadAutomation();
    } catch (error) {
      console.error("Daily command sweep failed:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The daily command sweep did not complete."
      );
      await loadAutomation();
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="devon-v2-glass overflow-hidden rounded-[2.75rem]">
      <div className="border-b border-slate-950/[0.07] p-7 md:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">
              <CalendarClock size={14} />
              Daily command sweep
            </div>
            <h2 className="text-3xl tracking-[-0.04em] text-[#07111f] md:text-4xl">
              Your whole command center, checked in one routine.
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
              Check deadlines, projects, birthdays, approvals, scheduled
              content, news, and connected sources—then report only what needs
              your attention.
            </p>
          </div>

          <button
            type="button"
            onClick={runNow}
            disabled={running || loading}
            className="devon-v2-soft-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {running ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Play size={17} fill="currentColor" />
            )}
            {running ? "Checking your command center…" : "Run command sweep"}
          </button>
        </div>

        {message ? (
          <div className="mt-5 flex gap-3 rounded-[1.5rem] border border-cyan-100 bg-cyan-50 p-4 text-cyan-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold leading-6">{message}</p>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 flex gap-3 rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold leading-6">{errorMessage}</p>
          </div>
        ) : null}
      </div>

      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        <div className="border-b border-slate-950/[0.07] p-7 md:p-8 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="devon-v2-label text-blue-600">Schedule</p>
              <p className="mt-2 text-sm font-bold text-slate-700">
                Every day at {schedule?.time ?? time}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void saveSchedule({ enabled: !(schedule?.enabled ?? true) })
              }
              disabled={saving || loading}
              className={`relative h-8 w-14 rounded-full p-1 transition ${
                schedule?.enabled ? "bg-blue-600" : "bg-slate-300"
              }`}
              aria-label={
                schedule?.enabled
                  ? "Pause daily command sweep"
                  : "Enable daily command sweep"
              }
              aria-pressed={schedule?.enabled}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow-sm transition ${
                  schedule?.enabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Brief time
            </span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Clock3
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                />
              </div>
              <button
                type="button"
                onClick={() => void saveSchedule({ time })}
                disabled={
                  saving ||
                  loading ||
                  !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
                }
                className="rounded-2xl bg-[#07111f] px-5 text-sm font-extrabold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </label>

          <div className="mt-6 rounded-[1.6rem] border border-slate-950/[0.07] bg-white/65 p-4">
            <div className="flex items-start gap-3">
              <BellRing size={18} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-extrabold text-slate-700">
                  Proactive in-app delivery is active
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {schedule?.enabled
                    ? `Next target: ${formatDateTime(
                        nextRunAt,
                        schedule.timezone
                      )} ${schedule.timezone}.`
                    : "The routine is paused. Manual runs still work."}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">
            The time and timezone are shared with Settings. Automatic
            clock-based triggering begins when Morrow is hosted; manual runs
            already use this exact workflow.
          </p>
        </div>

        <div className="p-7 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="devon-v2-label text-violet-600">Delivery & history</p>
              <p className="mt-2 text-sm font-bold text-slate-700">
                Real outcomes, not placeholder activity
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadAutomation()}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-950/[0.07] bg-white/75 text-slate-500 transition hover:text-blue-600"
              aria-label="Refresh automation history"
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <AlertMetric
              label="Active alerts"
              value={alertCounts.active}
              tone="text-blue-600"
            />
            <AlertMetric
              label="Critical"
              value={alertCounts.critical}
              tone="text-red-600"
            />
            <AlertMetric
              label="Warnings"
              value={alertCounts.warning}
              tone="text-amber-600"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {["Deadline", "Project", "Birthday", "Approval", "Content"].map(
              (category) => (
                <span
                  key={category}
                  className="rounded-full border border-slate-950/[0.07] bg-white/70 px-3 py-1.5 text-[10px] font-extrabold text-slate-500"
                >
                  {category} · {alertCounts.categories[category] ?? 0}
                </span>
              )
            )}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <DeliveryChip
              icon={BellRing}
              label="In-app"
              status="Working"
              active
            />
            <DeliveryChip icon={Mail} label="Email" status="Connect later" />
            <DeliveryChip
              icon={Smartphone}
              label="Phone"
              status="Connect later"
            />
          </div>

          <div className="mt-6 space-y-2.5">
            {loading ? (
              <div className="rounded-[1.6rem] border border-slate-950/[0.07] bg-white/60 p-5 text-sm font-semibold text-slate-500">
                Loading run history…
              </div>
            ) : runs.length ? (
              runs.slice(0, 4).map((run) => (
                <div
                  key={run.id}
                  className="rounded-[1.6rem] border border-slate-950/[0.07] bg-white/70 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${runStatusClass(
                            run.status
                          )}`}
                        >
                          {run.status}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          {run.trigger}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                        {run.summary || "Run started. Waiting for an outcome."}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-slate-400">
                      {formatDateTime(run.startedAt, schedule?.timezone)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white/45 p-6 text-center">
                <Newspaper size={22} className="mx-auto text-blue-500" />
                <p className="mt-3 text-sm font-extrabold text-slate-700">
                  No command sweep yet
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Run it once to create the first verified history record.
                </p>
              </div>
            )}
          </div>

          <Link
            href="/news"
            className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 transition hover:text-blue-800"
          >
            Open News Intelligence
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function DeliveryChip({
  icon: Icon,
  label,
  status,
  active = false,
}: {
  icon: typeof BellRing;
  label: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.35rem] border p-3 ${
        active
          ? "border-blue-100 bg-blue-50"
          : "border-slate-950/[0.07] bg-white/65"
      }`}
    >
      <Icon size={16} className={active ? "text-blue-600" : "text-slate-400"} />
      <p className="mt-3 text-xs font-extrabold text-slate-700">{label}</p>
      <p
        className={`mt-0.5 text-[10px] font-bold ${
          active ? "text-blue-500" : "text-slate-400"
        }`}
      >
        {status}
      </p>
    </div>
  );
}

function AlertMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-slate-950/[0.07] bg-white/70 p-4">
      <p className={`text-3xl font-black tracking-[-0.05em] ${tone}`}>{value}</p>
      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
