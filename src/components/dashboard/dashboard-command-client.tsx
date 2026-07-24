"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Briefcase,
  CalendarDays,
  Check,
  Clipboard,
  Clock3,
  Copy,
  Folder,
  Newspaper,
  RefreshCcw,
  Rocket,
  Send,
  ShieldCheck,
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
  if (!dateString) return "Waiting for the first scan";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Waiting for the first scan";

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function healthCopy(health: AutopilotResponse["health"] | undefined) {
  if (health === "critical") {
    return {
      label: "Needs action",
      title: "A few items need an immediate decision.",
      text: "Critical signals are at the top of your queue.",
      icon: AlertTriangle,
      dot: "bg-rose-500",
      tone: "text-rose-600 bg-rose-50",
    };
  }

  if (health === "attention") {
    return {
      label: "In motion",
      title: "Your priorities are clear.",
      text: "Review the queue, make the calls, and keep the work moving.",
      icon: Zap,
      dot: "bg-amber-500",
      tone: "text-amber-700 bg-amber-50",
    };
  }

  return {
    label: "On track",
    title: "Everything important is under control.",
    text: "No urgent pressure is showing across the workspace.",
    icon: ShieldCheck,
    dot: "bg-emerald-500",
    tone: "text-emerald-700 bg-emerald-50",
  };
}

function severityClass(severity: SignalSeverity) {
  if (severity === "critical") return "bg-rose-50 text-rose-700";
  if (severity === "high") return "bg-orange-50 text-orange-700";
  if (severity === "medium") return "bg-[#f0efff] text-[#6558e8]";
  return "bg-[#f1f1f3] text-[#7d7d86]";
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
  return Zap;
}

export function DashboardCommandClient() {
  const [data, setData] = useState<AutopilotResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAutopilotBrief = useCallback(async () => {
    try {
      setRefreshing(true);
      setErrorMessage("");

      const response = await fetch("/api/autopilot/brief", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Autopilot brief failed.");

      const result = (await response.json()) as AutopilotResponse;
      if (!result.ok) {
        throw new Error(result.message || "Autopilot response was invalid.");
      }

      setData(result);
    } catch (error) {
      console.error("Failed to load autopilot brief:", error);
      setErrorMessage("The daily brief could not be loaded. Try again.");
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAutopilotBrief();
  }, [loadAutopilotBrief]);

  const counts = data?.counts ?? emptyCounts;
  const health = healthCopy(data?.health);
  const HealthIcon = health.icon;
  const topSignals = data?.topSignals ?? [];

  const moduleCards = useMemo(
    () => [
      { title: "KPIs", value: counts.kpis, icon: Target, href: "/kpi" },
      {
        title: "Projects",
        value: counts.projects,
        icon: Briefcase,
        href: "/projects",
      },
      {
        title: "Social",
        value: counts.socialDrafts,
        icon: Send,
        href: "/social",
      },
      {
        title: "Assets",
        value: counts.assets,
        icon: Folder,
        href: "/assets",
      },
      {
        title: "Events",
        value: counts.events,
        icon: CalendarDays,
        href: "/events",
      },
      {
        title: "Birthdays",
        value: counts.birthdays,
        icon: Users,
        href: "/birthdays",
      },
      {
        title: "AI drafts",
        value: counts.aiDrafts,
        icon: Bot,
        href: "/ai",
      },
      {
        title: "News",
        value: counts.newsItems,
        icon: Newspaper,
        href: "/news/collector",
      },
    ],
    [counts]
  );

  async function copyBrief() {
    if (!data?.briefText) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(data.briefText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = data.briefText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setErrorMessage("The brief could not be copied. Select the text manually.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
        <div className="devon-dashboard-hero min-h-[390px] overflow-hidden rounded-[30px] p-6 text-white sm:p-8">
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                <span className={`h-1.5 w-1.5 rounded-full ${health.dot}`} />
                {health.label}
              </div>
              <span className="hidden text-[11px] font-medium text-white/40 sm:block">
                {data?.generatedAt
                  ? `Updated ${formatDateTime(data.generatedAt)}`
                  : "Preparing your view"}
              </span>
            </div>

            <div className="my-auto py-10">
              <p className="text-sm font-medium text-white/48">
                {getGreeting()}, Big Devon
              </p>
              <h2 className="mt-3 max-w-3xl text-[clamp(2.7rem,6vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.075em] text-white">
                {health.title}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/58 sm:text-base">
                {health.text}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/autopilot"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[13px] bg-white px-4 text-sm font-semibold text-[#1b1b20] transition hover:bg-white/90"
              >
                Open today’s plan
                <ArrowUpRight size={15} />
              </Link>
              <button
                type="button"
                onClick={() => void loadAutopilotBrief()}
                disabled={refreshing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[13px] border border-white/12 bg-white/[0.07] px-4 text-sm font-semibold text-white transition hover:bg-white/12 disabled:opacity-50"
              >
                <RefreshCcw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
              <button
                type="button"
                onClick={() => void copyBrief()}
                disabled={!data?.briefText}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[13px] border border-white/12 bg-white/[0.07] px-4 text-sm font-semibold text-white transition hover:bg-white/12 disabled:opacity-40"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy brief"}
              </button>
            </div>
          </div>
        </div>

        <div className="devon-surface flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9b9ba3]">
                Today at a glance
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#242429]">
                Signal readout
              </h3>
            </div>
            <span className={`rounded-full p-2.5 ${health.tone}`}>
              <HealthIcon size={17} />
            </span>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-black/[0.055] bg-black/[0.055]">
            <Metric value={counts.signals} label="All signals" />
            <Metric value={counts.critical} label="Critical" />
            <Metric value={counts.high} label="High priority" />
            <Metric value={counts.medium} label="Medium" />
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-center gap-3 rounded-[16px] bg-[#f6f6f8] p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white text-[#6d5dfc] shadow-sm">
                <Clock3 size={16} />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9c9ca4]">
                  Last scan
                </p>
                <p className="mt-1 text-xs font-semibold text-[#4b4b52]">
                  {loaded
                    ? formatDateTime(data?.generatedAt ?? "")
                    : "Reading the workspace…"}
                </p>
              </div>
            </div>

            {errorMessage ? (
              <div
                className="mt-3 flex gap-2 rounded-[14px] bg-rose-50 p-3 text-xs font-medium leading-5 text-rose-700"
                role="alert"
              >
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {errorMessage}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="devon-surface p-5 sm:p-6">
          <SectionHeading
            eyebrow="Priority queue"
            title="What needs you now"
            icon={Rocket}
          />

          {!loaded ? (
            <EmptyState
              title="Reading the workspace"
              text="Your priority queue will appear here in a moment."
            />
          ) : topSignals.length === 0 ? (
            <EmptyState
              title="Nothing urgent"
              text="The queue is clear. This is a good time to prepare what comes next."
            />
          ) : (
            <div className="mt-5 space-y-2">
              {topSignals.map((item) => {
                const Icon = moduleIcon(item.module);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex gap-3 rounded-[17px] border border-transparent bg-[#f7f7f9] p-3.5 transition hover:border-black/[0.06] hover:bg-white hover:shadow-sm"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#6d5dfc] shadow-sm">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${severityClass(item.severity)}`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-[10px] font-semibold text-[#a0a0a8]">
                          {item.module}
                        </span>
                      </span>
                      <span className="mt-2 block text-sm font-semibold text-[#333338]">
                        {item.title}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#878790]">
                        {item.detail}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={15}
                      className="mt-1 shrink-0 text-[#babac1] transition group-hover:text-[#6d5dfc]"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="devon-surface p-5 sm:p-6">
          <SectionHeading
            eyebrow="Daily brief"
            title="The concise readout"
            icon={Clipboard}
          />
          <div className="devon-scrollbar mt-5 max-h-[510px] overflow-auto rounded-[18px] bg-[#f6f6f8] p-4 sm:p-5">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-6 text-[#5f5f68]">
              {data?.briefText ??
                "Your daily brief is being prepared from the latest workspace signals."}
            </pre>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a0a0a8]">
              Workspace
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#29292e]">
              Everything in one view
            </h3>
          </div>
          <Link
            href="/command"
            className="text-xs font-semibold text-[#6d5dfc] hover:text-[#5144d9]"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {moduleCards.map((item) => (
            <ModuleCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white p-4">
      <p className="text-3xl font-semibold tracking-[-0.06em] text-[#25252a]">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold text-[#9999a1]">{label}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  icon: ElementType;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9b9ba3]">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#242429]">
          {title}
        </h3>
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f1f0ff] text-[#6d5dfc]">
        <Icon size={16} />
      </span>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-5 rounded-[18px] border border-dashed border-black/[0.1] bg-[#fafafa] px-5 py-10 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <ShieldCheck size={18} />
      </span>
      <p className="mt-3 text-sm font-semibold text-[#38383e]">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#92929a]">
        {text}
      </p>
    </div>
  );
}

function ModuleCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  icon: ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[18px] border border-black/[0.055] bg-white/80 p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition duration-200 hover:-translate-y-0.5 hover:border-black/[0.09] hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)]"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f2f1ff] text-[#6d5dfc]">
          <Icon size={14} />
        </span>
        <ArrowUpRight
          size={13}
          className="text-[#c1c1c7] transition group-hover:text-[#6d5dfc]"
        />
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-[-0.055em] text-[#27272c]">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[10px] font-semibold text-[#95959d]">
        {title}
      </p>
    </Link>
  );
}
