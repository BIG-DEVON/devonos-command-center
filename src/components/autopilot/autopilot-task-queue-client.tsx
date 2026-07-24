"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Database,
  ListTodo,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

type TaskSeverity = "critical" | "high" | "medium" | "low";
type TaskStatus = "Open" | "Doing" | "Waiting" | "Done" | "Archived";

type AutopilotTask = {
  id: string;
  title: string;
  module: string;
  severity: TaskSeverity;
  status: TaskStatus;
  dueDate: string;
  detail: string;
  action: string;
  href: string;
  sourceSignalId: string;
  createdAt: string;
  updatedAt: string;
};

type TasksApiResponse = {
  ok: boolean;
  tasks?: AutopilotTask[];
  task?: AutopilotTask;
  message?: string;
  created?: number;
  skipped?: number;
};

const statuses: TaskStatus[] = ["Open", "Doing", "Waiting", "Done", "Archived"];

async function fetchTasks() {
  const response = await fetch("/api/autopilot/tasks", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as TasksApiResponse;

  if (!response.ok || !data.ok || !data.tasks) {
    throw new Error(data.message || "Failed to load tasks.");
  }

  return data.tasks.map(normalizeTask);
}

function normalizeTask(item: Partial<AutopilotTask>): AutopilotTask {
  return {
    id: item.id ?? "",
    title: item.title ?? "",
    module: item.module ?? "",
    severity: (item.severity ?? "medium") as TaskSeverity,
    status: (item.status ?? "Open") as TaskStatus,
    dueDate: item.dueDate ?? "",
    detail: item.detail ?? "",
    action: item.action ?? "",
    href: item.href ?? "/dashboard",
    sourceSignalId: item.sourceSignalId ?? "",
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
  }).format(date);
}

function severityClass(severity: TaskSeverity) {
  if (severity === "critical") return "border-red-100 bg-red-50 text-red-600";
  if (severity === "high") return "border-blue-100 bg-blue-50 text-blue-600";
  if (severity === "medium")
    return "border-violet-100 bg-violet-50 text-violet-600";

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function statusClass(status: TaskStatus) {
  if (status === "Done") return "border-blue-100 bg-blue-50 text-blue-600";
  if (status === "Doing")
    return "border-violet-100 bg-violet-50 text-violet-600";
  if (status === "Waiting")
    return "border-amber-100 bg-amber-50 text-amber-600";
  if (status === "Archived")
    return "border-slate-200 bg-slate-100 text-slate-500";

  return "border-slate-950/[0.08] bg-white text-slate-600";
}

function sortTasks(tasks: AutopilotTask[]) {
  const severityRank: Record<TaskSeverity, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  const statusRank: Record<TaskStatus, number> = {
    Open: 1,
    Doing: 2,
    Waiting: 3,
    Done: 4,
    Archived: 5,
  };

  return [...tasks].sort((a, b) => {
    const statusDiff = statusRank[a.status] - statusRank[b.status];
    if (statusDiff !== 0) return statusDiff;

    const severityDiff = severityRank[a.severity] - severityRank[b.severity];
    if (severityDiff !== 0) return severityDiff;

    return a.title.localeCompare(b.title);
  });
}

export function AutopilotTaskQueueClient() {
  const [tasks, setTasks] = useState<AutopilotTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadTasks() {
    try {
      setErrorMessage("");
      setTasks(await fetchTasks());
    } catch (error) {
      console.error("Failed to load Autopilot tasks:", error);
      setErrorMessage("DevonOS could not load the Autopilot task queue.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetchTasks()
      .then((items) => {
        if (!cancelled) {
          setTasks(items);
        }
      })
      .catch((error) => {
        console.error("Failed to load Autopilot tasks:", error);

        if (!cancelled) {
          setErrorMessage("DevonOS could not load the Autopilot task queue.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openTasks = tasks.filter((task) => task.status === "Open").length;
  const doingTasks = tasks.filter((task) => task.status === "Doing").length;
  const waitingTasks = tasks.filter((task) => task.status === "Waiting").length;
  const doneTasks = tasks.filter((task) => task.status === "Done").length;

  const activeTasks = useMemo(() => {
    return sortTasks(
      tasks.filter(
        (task) => task.status !== "Done" && task.status !== "Archived"
      )
    );
  }, [tasks]);

  async function generateTasks() {
    try {
      setGenerating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/autopilot/tasks/generate", {
        method: "POST",
      });

      const data = (await response.json()) as TasksApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Task generation failed.");
      }

      setSuccessMessage(data.message || "Autopilot tasks generated.");
      await loadTasks();
    } catch (error) {
      console.error("Failed to generate Autopilot tasks:", error);
      setErrorMessage(
        "DevonOS could not generate tasks from the current signals."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    try {
      setBusyId(id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/autopilot/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as TasksApiResponse;

      if (!response.ok || !data.ok || !data.task) {
        throw new Error(data.message || "Task update failed.");
      }

      const updatedTask = normalizeTask(data.task);

      setTasks((current) =>
        current.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (error) {
      console.error("Failed to update task:", error);
      setErrorMessage("DevonOS could not update that task.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTask(id: string) {
    try {
      setBusyId(id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/autopilot/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Task deletion failed.");
      }

      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
      setErrorMessage("DevonOS could not delete that task.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="devon-v2-glass rounded-[2.75rem] p-7">
        <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
              <ListTodo size={14} />
              Autopilot Work Queue
            </div>

            <h2 className="text-4xl text-[#07111f] md:text-5xl">
              Turn pressure into tasks.
            </h2>

            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
              DevonOS reads your Autopilot signals and creates a practical task
              queue so your work stops living inside your head.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={loadTasks}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/75 px-5 py-3 text-sm font-extrabold text-slate-600 shadow-[0_16px_48px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <button
              onClick={generateTasks}
              disabled={generating}
              className="devon-v2-soft-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <Sparkles size={16} />
              {generating ? "Creating tasks..." : "Generate Tasks"}
            </button>
          </div>
        </div>

        {successMessage ? (
          <div className="mb-5 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-4 text-blue-600">
            <div className="flex gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold leading-6">
                {successMessage}
              </p>
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-5 rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-red-600">
            <div className="flex gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold leading-6">
                {errorMessage}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-4">
          <MiniStat value={openTasks} label="Open" icon={Zap} />
          <MiniStat value={doingTasks} label="Doing" icon={Clock} />
          <MiniStat value={waitingTasks} label="Waiting" icon={Database} />
          <MiniStat value={doneTasks} label="Done" icon={ShieldCheck} />
        </div>
      </div>

      <div className="grid gap-4">
        {!loaded ? (
          <EmptyState
            icon={RefreshCcw}
            title="Loading task queue"
            text="DevonOS is fetching your Autopilot tasks."
          />
        ) : activeTasks.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No active Autopilot tasks"
            text="Generate tasks from the current Autopilot signals when you are ready."
          />
        ) : (
          activeTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.04 * index,
                duration: 0.42,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="devon-v2-glass rounded-[2.1rem] p-5"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-extrabold uppercase ${severityClass(
                        task.severity
                      )}`}
                    >
                      {task.severity}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusClass(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>

                    <span className="rounded-full border border-slate-950/[0.08] bg-white/75 px-3 py-1 text-xs font-extrabold text-slate-500">
                      {task.module || "Autopilot"}
                    </span>
                  </div>

                  <h3 className="text-2xl text-[#07111f]">{task.title}</h3>

                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                    {task.detail}
                  </p>

                  <div className="mt-4 rounded-[1.5rem] border border-slate-950/[0.07] bg-white/65 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">
                      Recommended Action
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                      {task.action}
                    </p>
                  </div>

                  <p className="mt-3 text-xs font-bold text-slate-400">
                    Due: {formatDate(task.dueDate)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 lg:min-w-[220px]">
                  <Link
                    href={task.href || "/dashboard"}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#07111f] px-4 py-3 text-sm font-extrabold text-white shadow-[0_18px_55px_rgba(15,23,42,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600"
                  >
                    Open Module
                    <ArrowUpRight size={16} />
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateTaskStatus(task.id, status)}
                        disabled={busyId === task.id}
                        className="rounded-2xl border border-slate-950/[0.08] bg-white/70 px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    disabled={busyId === task.id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-600 transition duration-300 hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

function MiniStat({
  value,
  label,
  icon: Icon,
}: {
  value: number;
  label: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-[1.7rem] border border-slate-950/[0.07] bg-white/66 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
        <Icon size={17} />
      </div>

      <p className="devon-v2-stat text-4xl text-[#07111f]">{value}</p>

      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
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
    <div className="devon-v2-glass rounded-[2.1rem] p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
        <Icon size={23} />
      </div>

      <h3 className="text-2xl text-[#07111f]">{title}</h3>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

export default AutopilotTaskQueueClient;
