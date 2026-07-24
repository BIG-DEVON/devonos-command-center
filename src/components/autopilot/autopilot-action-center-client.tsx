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
  CheckCircle2,
  Clipboard,
  Copy,
  Database,
  FileText,
  Newspaper,
  RefreshCcw,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
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

type AutopilotBriefResponse = {
  ok: boolean;
  generatedAt: string;
  health: "critical" | "attention" | "stable";
  counts: AutopilotCounts;
  signals: CommandSignal[];
  topSignals: CommandSignal[];
  briefText: string;
  message?: string;
};

type ExecuteResponse = {
  ok: boolean;
  action?: string;
  createdType?: string;
  href?: string;
  message?: string;
  record?: unknown;
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

function healthConfig(health: AutopilotBriefResponse["health"] | undefined) {
  if (health === "critical") {
    return {
      label: "Critical",
      title: "Urgent command pressure detected",
      text: "DevonOS found critical items that should be handled immediately.",
      icon: AlertTriangle,
      chip: "border-red-100 bg-red-50 text-red-600",
      gradient: "from-red-500 to-pink-500",
    };
  }

  if (health === "attention") {
    return {
      label: "Attention",
      title: "DevonOS has work for you",
      text: "Some items need review, approval, follow-up, or preparation.",
      icon: Zap,
      chip: "border-blue-100 bg-blue-50 text-blue-600",
      gradient: "from-blue-600 to-violet-600",
    };
  }

  return {
    label: "Stable",
    title: "The command center is calm",
    text: "No heavy pressure detected. This is a good time to prepare ahead.",
    icon: ShieldCheck,
    chip: "border-cyan-100 bg-cyan-50 text-cyan-600",
    gradient: "from-cyan-500 to-blue-600",
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

function moduleIcon(module: string): ElementType {
  const lower = module.toLowerCase();

  if (lower.includes("kpi")) return Target;
  if (lower.includes("social")) return Send;
  if (lower.includes("ai")) return Bot;
  if (lower.includes("news")) return Newspaper;

  return Sparkles;
}

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

export function AutopilotActionCenterClient() {
  const [data, setData] = useState<AutopilotBriefResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadBrief() {
    try {
      setRefreshing(true);
      setErrorMessage("");

      const response = await fetch("/api/autopilot/brief", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load Autopilot brief.");
      }

      const result = (await response.json()) as AutopilotBriefResponse;

      if (!result.ok) {
        throw new Error(result.message || "Autopilot response was invalid.");
      }

      setData(result);
    } catch (error) {
      console.error("Failed to load Autopilot brief:", error);
      setErrorMessage("DevonOS could not load the Autopilot brief.");
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadBrief();
  }, []);

  const counts = data?.counts ?? emptyCounts;
  const health = healthConfig(data?.health);
  const HealthIcon = health.icon;

  const actionCards = useMemo(
    () => [
      {
        title: "Create Social Draft",
        text: "DevonOS turns today’s command signals into a Social Studio draft you can review and post later.",
        icon: Send,
        action: "create_social_draft",
        href: "/social",
        button: "Generate Draft",
      },
      {
        title: "Create AI Review Draft",
        text: "DevonOS creates an AI Studio review draft from the command brief for executive-style summarization.",
        icon: Bot,
        action: "create_ai_review_draft",
        href: "/ai",
        button: "Create Review",
      },
    ],
    []
  );

  async function runAction(action: string) {
    try {
      setBusyAction(action);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/autopilot/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const result = (await response.json()) as ExecuteResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Autopilot action failed.");
      }

      setSuccessMessage(result.message || "Autopilot action completed.");
      await loadBrief();
    } catch (error) {
      console.error("Autopilot action failed:", error);
      setErrorMessage("DevonOS could not complete that Autopilot action.");
    } finally {
      setBusyAction(null);
    }
  }

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
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="devon-v2-dark-card rounded-[2.75rem] p-8 text-white"
        >
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white/55">
              <Rocket size={14} className="text-blue-200" />
              Autopilot Action Center
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-6xl">
              Turn signals into next steps.
            </h1>

            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-white/62 md:text-lg">
              Create the first draft, shape the brief, and move the right work
              forward from the records already in your workspace.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-4">
              <HeroMetric value={counts.signals} label="Signals" />
              <HeroMetric value={counts.high} label="High" />
              <HeroMetric value={counts.medium} label="Medium" />
              <HeroMetric value={counts.aiDrafts} label="AI Drafts" />
            </div>

            <div className="mt-7 flex flex-col gap-3 md:flex-row">
              <button
                onClick={loadBrief}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#07111f] shadow-[0_18px_55px_rgba(255,255,255,0.15)] transition duration-300 hover:-translate-y-0.5 disabled:opacity-50"
              >
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Scanning..." : "Scan Database"}
              </button>

              <button
                onClick={copyBrief}
                disabled={!data?.briefText}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.075] px-5 py-3 text-sm font-extrabold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/12 disabled:opacity-50"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Brief"}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="devon-v2-glass rounded-[2.75rem] p-7"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div
                className={`mb-4 inline-flex rounded-full border px-3 py-1.5 text-xs font-extrabold ${health.chip}`}
              >
                {health.label}
              </div>
              <h2 className="text-3xl text-[#07111f]">{health.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                {health.text}
              </p>
            </div>

            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${health.gradient} text-white shadow-[0_18px_50px_rgba(37,99,235,0.18)]`}
            >
              <HealthIcon size={23} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-950/[0.07] bg-white/70 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Last Autopilot Scan
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

          {successMessage ? (
            <div className="mt-4 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-4 text-blue-600">
              <div className="flex gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-semibold leading-6">
                  {successMessage}
                </p>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-red-600">
              <div className="flex gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-semibold leading-6">
                  {errorMessage}
                </p>
              </div>
            </div>
          ) : null}
        </motion.div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {actionCards.map((item, index) => {
          const Icon = item.icon;
          const isBusy = busyAction === item.action;

          return (
            <motion.div
              key={item.action}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.06 * index,
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="devon-v2-glass rounded-[2.5rem] p-6"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
                  <Icon size={23} />
                </div>

                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-950/[0.07] bg-white/70 px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-white hover:text-blue-600"
                >
                  Open Module
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <h2 className="text-3xl text-[#07111f]">{item.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                {item.text}
              </p>

              <button
                onClick={() => runAction(item.action)}
                disabled={isBusy}
                className="devon-v2-soft-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <Sparkles size={16} />
                {isBusy ? "DevonOS is working..." : item.button}
              </button>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="devon-v2-glass rounded-[2.5rem] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="devon-v2-label text-blue-600">Signal Queue</p>
              <h2 className="mt-2 text-3xl text-[#07111f]">
                What DevonOS found
              </h2>
            </div>

            <Clipboard size={22} className="text-blue-600" />
          </div>

          {!loaded ? (
            <EmptyState
              icon={RefreshCcw}
              title="Loading signals"
              text="DevonOS is reading your database."
            />
          ) : data?.topSignals.length ? (
            <div className="space-y-3">
              {data.topSignals.map((signal, index) => {
                const Icon = moduleIcon(signal.module);

                return (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.04 * index,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={signal.href}
                      className="group block rounded-[1.7rem] border border-slate-950/[0.075] bg-white/66 p-4 shadow-[0_16px_48px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-1 hover:bg-white"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase ${severityClass(
                                signal.severity
                              )}`}
                            >
                              {signal.severity}
                            </span>

                            <span className="text-xs font-bold text-slate-400">
                              {signal.module}
                            </span>
                          </div>

                          <h3 className="text-base text-[#07111f]">
                            {signal.title}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                            {signal.detail}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="No pressure detected"
              text="DevonOS did not find urgent work right now."
            />
          )}
        </div>

        <div className="devon-v2-glass rounded-[2.5rem] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="devon-v2-label text-violet-600">Command Brief</p>
              <h2 className="mt-2 text-3xl text-[#07111f]">
                Daily work summary
              </h2>
            </div>

            <FileText size={22} className="text-violet-600" />
          </div>

          <div className="rounded-[2rem] border border-slate-950/[0.075] bg-white/72 p-5">
            <pre className="max-h-[680px] overflow-auto whitespace-pre-wrap font-sans text-sm font-medium leading-7 text-slate-700">
              {data?.briefText ??
                "DevonOS is preparing your command brief..."}
            </pre>
          </div>
        </div>
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
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}
