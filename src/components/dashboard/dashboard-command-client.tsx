"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Clock,
  Copy,
  Crown,
  Database,
  FileText,
  Folder,
  Newspaper,
  Radio,
  RefreshCcw,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

type SignalSeverity = "critical" | "high" | "medium" | "low";

type CommandSignal = {
  id: string;
  module: string;
  title: string;
  detail: string;
  severity: SignalSeverity;
  href: string;
  action: string;
  sortScore: number;
};

type AutopilotCounts = {
  kpis: number;
  projects: number;
  socialDrafts: number;
  assets: number;
  events: number;
  birthdays: number;
  aiDrafts: number;
  newsItems: number;
  signals: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

type AutopilotResponse = {
  ok: boolean;
  generatedAt: string;
  health: "critical" | "attention" | "stable";
  counts: AutopilotCounts;
  signals: CommandSignal[];
  topSignals: CommandSignal[];
  briefText: string;
  message?: string;
};

const emptyCounts: AutopilotCounts = {
  kpis: 0,
  projects: 0,
  socialDrafts: 0,
  assets: 0,
  events: 0,
  birthdays: 0,
  aiDrafts: 0,
  newsItems: 0,
  signals: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
};

function formatDateTime(dateString: string) {
  if (!dateString) return "Not generated yet";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Not generated yet";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function healthCopy(health: AutopilotResponse["health"] | undefined) {
  if (health === "critical") {
    return {
      label: "Critical",
      title: "DevonOS found urgent issues",
      text: "There are critical signals that need immediate attention before they become serious blockers.",
      className: "from-red-500 to-pink-500",
      chip: "border-red-100 bg-red-50 text-red-600",
      icon: AlertTriangle,
    };
  }

  if (health === "attention") {
    return {
      label: "Attention",
      title: "DevonOS has work for you",
      text: "There are active signals that need review, follow-up, approval, or preparation.",
      className: "from-blue-600 to-violet-600",
      chip: "border-blue-100 bg-blue-50 text-blue-600",
      icon: Zap,
    };
  }

  return {
    label: "Stable",
    title: "Command center is calm",
    text: "No urgent pressure detected. This is a good time to prepare, polish, and get ahead.",
    className: "from-cyan-500 to-blue-600",
    chip: "border-cyan-100 bg-cyan-50 text-cyan-600",
    icon: ShieldCheck,
  };
}

function severityClass(severity: SignalSeverity) {
  if (severity === "critical") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (severity === "high") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (severity === "medium") {
    return "border-violet-100 bg-violet-50 text-violet-600";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function severityDot(severity: SignalSeverity) {
  if (severity === "critical") return "bg-red-500";
  if (severity === "high") return "bg-blue-600";
  if (severity === "medium") return "bg-violet-500";
  return "bg-slate-400";
}

function moduleIcon(module: string): ElementType {
  const lower = module.toLowerCase();

  if (lower.includes("kpi")) return Target;
  if (lower.includes("project")) return Briefcase;
  if (lower.includes("social")) return Send;
  if (lower.includes("asset")) return Folder;
  if (lower.includes("event")) return CalendarDays;
  if (lower.includes("birthday")) return Users;
  if (lower.includes("ai")) return Bot;
  if (lower.includes("news")) return Newspaper;

  return Sparkles;
}

export function DashboardCommandClient() {
  const [data, setData] = useState<AutopilotResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadAutopilotBrief() {
    try {
      setRefreshing(true);
      setErrorMessage("");

      const response = await fetch("/api/autopilot/brief", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Autopilot brief failed.");
      }

      const result = (await response.json()) as AutopilotResponse;

      if (!result.ok) {
        throw new Error(result.message || "Autopilot response was invalid.");
      }

      setData(result);
    } catch (error) {
      console.error("Failed to load autopilot brief:", error);
      setErrorMessage("DevonOS Autopilot could not load the command brief.");
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAutopilotBrief();
  }, []);

  const counts = data?.counts ?? emptyCounts;
  const health = healthCopy(data?.health);
  const HealthIcon = health.icon;

  const topSignals = data?.topSignals ?? [];
  const allSignals = data?.signals ?? [];

  const moduleCards = useMemo(
    () => [
      {
        title: "KPIs",
        value: counts.kpis,
        sub: "tracked outcomes",
        icon: Target,
        href: "/kpi",
        tone: "blue",
      },
      {
        title: "Projects",
        value: counts.projects,
        sub: "workstreams",
        icon: Briefcase,
        href: "/projects",
        tone: "violet",
      },
      {
        title: "Social",
        value: counts.socialDrafts,
        sub: "drafts",
        icon: Send,
        href: "/social",
        tone: "cyan",
      },
      {
        title: "Assets",
        value: counts.assets,
        sub: "records",
        icon: Folder,
        href: "/assets",
        tone: "pink",
      },
      {
        title: "Events",
        value: counts.events,
        sub: "moments",
        icon: CalendarDays,
        href: "/events",
        tone: "amber",
      },
      {
        title: "Birthdays",
        value: counts.birthdays,
        sub: "profiles",
        icon: Users,
        href: "/birthdays",
        tone: "blue",
      },
      {
        title: "AI Studio",
        value: counts.aiDrafts,
        sub: "drafts",
        icon: Bot,
        href: "/ai",
        tone: "violet",
      },
      {
        title: "News",
        value: counts.newsItems,
        sub: "signals",
        icon: Newspaper,
        href: "/news/collector",
        tone: "cyan",
      },
    ],
    [counts]
  );

  async function copyBrief() {
    if (!data?.briefText) return;

    await navigator.clipboard.writeText(data.briefText);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="devon-v2-dark-card rounded-[2.75rem] p-7 text-white md:p-9"
        >
          <div className="relative z-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white/55 backdrop-blur-xl">
                  <Crown size={14} className="text-blue-200" />
                  Autopilot Command Brief
                </div>

                <h1 className="devon-v2-premium-heading max-w-3xl text-5xl text-white md:text-7xl">
                  DevonOS is watching the work.
                </h1>

                <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-white/62 md:text-lg">
                  It reads your database, detects pressure points, and tells you
                  what needs action before your day gets messy.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.075] p-4 backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <div className="devon-v2-orb flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600">
                    <HealthIcon size={22} />
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/35">
                      System Health
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-white">
                      {health.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <HeroMetric value={counts.signals} label="Total Signals" />
              <HeroMetric value={counts.critical} label="Critical" />
              <HeroMetric value={counts.high} label="High Priority" />
              <HeroMetric value={counts.medium} label="Medium" />
            </div>

            <div className="mt-7 flex flex-col gap-3 md:flex-row">
              <button
                onClick={loadAutopilotBrief}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#07111f] shadow-[0_18px_55px_rgba(255,255,255,0.15)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh Autopilot"}
              </button>

              <button
                onClick={copyBrief}
                disabled={!data?.briefText}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.075] px-5 py-3 text-sm font-extrabold text-white shadow-[0_18px_55px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Brief"}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="devon-v2-glass rounded-[2.75rem] p-7"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className={`mb-4 inline-flex rounded-full border px-3 py-1.5 text-xs font-extrabold ${health.chip}`}>
                {health.label}
              </div>
              <h2 className="text-3xl text-[#07111f]">{health.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                {health.text}
              </p>
            </div>

            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Rocket size={22} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-950/[0.07] bg-white/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Last Scan
              </p>
              <Database size={15} className="text-blue-600" />
            </div>

            <p className="text-sm font-bold leading-7 text-slate-700">
              {data?.generatedAt
                ? formatDateTime(data.generatedAt)
                : loaded
                  ? "No scan generated yet"
                  : "Loading scan..."}
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-red-600">
              <div className="flex gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-semibold leading-6">{errorMessage}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniHealth value={counts.low} label="Low" />
            <MiniHealth value={allSignals.length} label="All Signals" />
          </div>
        </motion.div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="devon-v2-glass rounded-[2.5rem] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="devon-v2-label text-blue-600">Priority Queue</p>
              <h2 className="mt-2 text-3xl text-[#07111f]">What needs you now</h2>
            </div>

            <Radio size={22} className="text-blue-600" />
          </div>

          {!loaded ? (
            <EmptyState
              icon={RefreshCcw}
              title="Loading Autopilot"
              text="Reading your database and building the daily command queue."
            />
          ) : topSignals.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No urgent signals"
              text="Your command center is calm. Use this time to prepare and polish."
            />
          ) : (
            <div className="space-y-3">
              {topSignals.map((item, index) => {
                const Icon = moduleIcon(item.module);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 * index,
                      duration: 0.42,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      className="group block rounded-[1.7rem] border border-slate-950/[0.075] bg-white/66 p-4 shadow-[0_16px_48px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_70px_rgba(37,99,235,0.11)]"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase ${severityClass(
                                item.severity
                              )}`}
                            >
                              {item.severity}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {item.module}
                            </span>
                          </div>

                          <h3 className="text-base text-[#07111f]">
                            {item.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                            {item.detail}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="line-clamp-1 text-xs font-bold text-blue-600">
                              {item.action}
                            </p>
                            <ArrowUpRight
                              size={16}
                              className="shrink-0 text-slate-300 transition duration-300 group-hover:text-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="devon-v2-glass rounded-[2.5rem] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="devon-v2-label text-violet-600">Daily Brief</p>
              <h2 className="mt-2 text-3xl text-[#07111f]">
                Autopilot summary
              </h2>
            </div>

            <Clipboard size={22} className="text-violet-600" />
          </div>

          <div className="rounded-[2rem] border border-slate-950/[0.075] bg-white/72 p-5">
            <pre className="max-h-[640px] overflow-auto whitespace-pre-wrap font-sans text-sm font-medium leading-7 text-slate-700">
              {data?.briefText ??
                "DevonOS is preparing the daily command brief..."}
            </pre>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {moduleCards.map((item, index) => (
          <ModuleCard key={item.title} {...item} index={index} />
        ))}
      </section>
    </div>
  );
}

function HeroMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.075] p-4 backdrop-blur-xl">
      <p className="devon-v2-stat text-4xl text-white">{value}</p>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.18em] text-white/38">
        {label}
      </p>
    </div>
  );
}

function MiniHealth({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-950/[0.07] bg-white/64 p-4">
      <p className="devon-v2-stat text-3xl text-[#07111f]">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-400">{label}</p>
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
    <div className="rounded-[2rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
      <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
        <Icon size={22} />
      </div>
      <h3 className="text-xl text-[#07111f]">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function ModuleCard({
  title,
  value,
  sub,
  icon: Icon,
  href,
  tone,
  index,
}: {
  title: string;
  value: number;
  sub: string;
  icon: ElementType;
  href: string;
  tone: string;
  index: number;
}) {
  const toneClass =
    tone === "blue"
      ? "devon-v2-color-chip-blue"
      : tone === "violet"
        ? "devon-v2-color-chip-violet"
        : tone === "cyan"
          ? "devon-v2-color-chip-cyan"
          : tone === "pink"
            ? "devon-v2-color-chip-pink"
            : "devon-v2-color-chip-amber";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.05 * index,
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={href}
        className="group devon-v2-glass block rounded-[2rem] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(37,99,235,0.13)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}
          >
            <Icon size={20} />
          </div>

          <ArrowUpRight
            size={17}
            className="text-slate-300 transition duration-300 group-hover:text-blue-600"
          />
        </div>

        <p className="text-sm font-bold text-slate-400">{title}</p>
        <p className="devon-v2-stat mt-2 text-4xl text-[#07111f]">{value}</p>
        <p className="mt-1 text-xs font-bold text-slate-400">{sub}</p>
      </Link>
    </motion.div>
  );
}