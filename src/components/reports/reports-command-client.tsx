"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  FileText,
  Folder,
  RefreshCcw,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

type ReportMetrics = {
  kpis: number;
  completedKpis: number;
  delayedKpis: number;
  criticalKpis: number;
  socialDrafts: number;
  approvedPosts: number;
  postedPosts: number;
  assets: number;
  readyAssets: number;
  events: number;
  upcomingEvents: number;
  birthdays: number;
};

const STORAGE_KEYS = {
  kpis: "devonos.kpis.v1",
  social: "devonos.social-drafts.v1",
  assets: "devonos.assets.v1",
  events: "devonos.global-events.v1",
  birthdays: "devonos.birthdays.v1",
};

const emptyMetrics: ReportMetrics = {
  kpis: 0,
  completedKpis: 0,
  delayedKpis: 0,
  criticalKpis: 0,
  socialDrafts: 0,
  approvedPosts: 0,
  postedPosts: 0,
  assets: 0,
  readyAssets: 0,
  events: 0,
  upcomingEvents: 0,
  birthdays: 0,
};

function safeReadArray(key: string) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

  const diff = date.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDate() {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function getReportHealth(metrics: ReportMetrics) {
  const totalWork =
    metrics.kpis +
    metrics.socialDrafts +
    metrics.assets +
    metrics.events +
    metrics.birthdays;

  if (totalWork === 0) return 0;

  const strongSignals =
    metrics.completedKpis +
    metrics.approvedPosts +
    metrics.postedPosts +
    metrics.readyAssets +
    metrics.upcomingEvents;

  return Math.min(100, Math.round((strongSignals / Math.max(totalWork, 1)) * 100));
}

function buildReport(metrics: ReportMetrics) {
  const health = getReportHealth(metrics);

  const lines: string[] = [];

  lines.push("DEVONOS COMMAND REPORT");
  lines.push(`Date: ${formatDate()}`);
  lines.push("");
  lines.push("Executive Summary");
  lines.push(
    `DevonOS currently tracks ${metrics.kpis} KPI item(s), ${metrics.socialDrafts} social draft(s), ${metrics.assets} asset record(s), ${metrics.events} event(s), and ${metrics.birthdays} birthday profile(s).`
  );
  lines.push("");
  lines.push(`Command Health: ${health}%`);
  lines.push("");

  lines.push("KPI Command");
  lines.push(`- Total KPIs: ${metrics.kpis}`);
  lines.push(`- Completed KPIs: ${metrics.completedKpis}`);
  lines.push(`- Delayed KPIs: ${metrics.delayedKpis}`);
  lines.push(`- Critical KPIs: ${metrics.criticalKpis}`);
  lines.push("");

  lines.push("Social Studio");
  lines.push(`- Total drafts: ${metrics.socialDrafts}`);
  lines.push(`- Approved posts: ${metrics.approvedPosts}`);
  lines.push(`- Posted posts: ${metrics.postedPosts}`);
  lines.push("");

  lines.push("Asset Library");
  lines.push(`- Total asset records: ${metrics.assets}`);
  lines.push(`- Ready or approved assets: ${metrics.readyAssets}`);
  lines.push("");

  lines.push("Events & Birthdays");
  lines.push(`- Saved events: ${metrics.events}`);
  lines.push(`- Upcoming events within 30 days: ${metrics.upcomingEvents}`);
  lines.push(`- Birthday profiles: ${metrics.birthdays}`);
  lines.push("");

  lines.push("Recommended Focus");
  if (metrics.delayedKpis > 0) {
    lines.push("- Review delayed KPIs and decide what needs escalation.");
  }
  if (metrics.criticalKpis > 0) {
    lines.push("- Prioritize critical KPI items before lower-priority tasks.");
  }
  if (metrics.socialDrafts > metrics.approvedPosts + metrics.postedPosts) {
    lines.push("- Move pending social drafts into review or approval.");
  }
  if (metrics.assets > metrics.readyAssets) {
    lines.push("- Clean up asset records and mark ready files accurately.");
  }
  if (metrics.upcomingEvents > 0) {
    lines.push("- Prepare content early for upcoming events.");
  }

  if (
    metrics.delayedKpis === 0 &&
    metrics.criticalKpis === 0 &&
    metrics.socialDrafts === 0 &&
    metrics.assets === 0 &&
    metrics.upcomingEvents === 0
  ) {
    lines.push("- Add more records into DevonOS to generate stronger reports.");
  }

  return lines.join("\n");
}

export function ReportsCommandClient() {
  const [metrics, setMetrics] = useState<ReportMetrics>(emptyMetrics);
  const [copied, setCopied] = useState(false);

  function refreshMetrics() {
    const kpis = safeReadArray(STORAGE_KEYS.kpis);
    const social = safeReadArray(STORAGE_KEYS.social);
    const assets = safeReadArray(STORAGE_KEYS.assets);
    const events = safeReadArray(STORAGE_KEYS.events);
    const birthdays = safeReadArray(STORAGE_KEYS.birthdays);

    const nextMetrics: ReportMetrics = {
      kpis: kpis.length,
      completedKpis: kpis.filter((item) => item.status === "Completed").length,
      delayedKpis: kpis.filter((item) => item.status === "Delayed").length,
      criticalKpis: kpis.filter((item) => item.priority === "Critical").length,

      socialDrafts: social.length,
      approvedPosts: social.filter((item) => item.status === "Approved").length,
      postedPosts: social.filter((item) => item.status === "Posted").length,

      assets: assets.length,
      readyAssets: assets.filter(
        (item) => item.status === "Ready" || item.status === "Approved"
      ).length,

      events: events.length,
      upcomingEvents: events.filter((item) => {
        const days = getDaysUntil(item.date);
        return days >= 0 && days <= 30;
      }).length,

      birthdays: birthdays.length,
    };

    setMetrics(nextMetrics);
  }

  useEffect(() => {
    refreshMetrics();
  }, []);

  const commandHealth = getReportHealth(metrics);
  const report = useMemo(() => buildReport(metrics), [metrics]);

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
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
                Command Health
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {commandHealth}% operational signal
              </h2>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/36">
              <span>System Readiness</span>
              <span>{commandHealth}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${commandHealth}%` }}
              />
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-white/58">
            This score grows when KPIs are completed, posts are approved or
            posted, assets are ready, and upcoming events are tracked early.
          </p>

          <button
            onClick={refreshMetrics}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh Report Data
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetricCard
            title="KPI Items"
            value={metrics.kpis}
            sub={`${metrics.completedKpis} completed`}
            icon={Target}
          />
          <MetricCard
            title="Social Drafts"
            value={metrics.socialDrafts}
            sub={`${metrics.approvedPosts} approved`}
            icon={Share2}
          />
          <MetricCard
            title="Assets"
            value={metrics.assets}
            sub={`${metrics.readyAssets} ready`}
            icon={Folder}
          />
          <MetricCard
            title="Events"
            value={metrics.events}
            sub={`${metrics.upcomingEvents} upcoming`}
            icon={CalendarDays}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
              <TrendingUp size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Focus Signals
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                What DevonOS thinks needs attention.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <SignalRow
              icon={Clock}
              title="Delayed KPIs"
              value={metrics.delayedKpis}
              note="Review blocked or overdue work."
            />

            <SignalRow
              icon={Sparkles}
              title="Critical KPIs"
              value={metrics.criticalKpis}
              note="Handle priority items first."
            />

            <SignalRow
              icon={CheckCircle2}
              title="Ready Assets"
              value={metrics.readyAssets}
              note="Use approved files confidently."
            />

            <SignalRow
              icon={Users}
              title="Birthday Profiles"
              value={metrics.birthdays}
              note="Useful for internal culture moments."
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <FileText size={14} className="text-[#5B5DF5]" />
                Auto Report
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Weekly command report
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                DevonOS generates a clean report from the records saved across
                your command modules.
              </p>
            </div>

            <button
              onClick={copyReport}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Report"}
            </button>
          </div>

          <div className="rounded-[1.6rem] border border-slate-950/[0.08] bg-white/72 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.04)]">
            <pre className="max-h-[760px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {report}
            </pre>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MiniPanel
            title="Completed KPIs"
            value={metrics.completedKpis}
            label="Execution"
          />
          <MiniPanel
            title="Posted Content"
            value={metrics.postedPosts}
            label="Publishing"
          />
          <MiniPanel
            title="Upcoming Events"
            value={metrics.upcomingEvents}
            label="Planning"
          />
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

function SignalRow({
  icon: Icon,
  title,
  value,
  note,
}: {
  icon: ElementType;
  title: string;
  value: number;
  note: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-slate-950/[0.08] bg-white/68 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-600">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#0B0D12]">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{note}</p>
        </div>
      </div>

      <p className="text-2xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
        {value}
      </p>
    </div>
  );
}

function MiniPanel({
  title,
  value,
  label,
}: {
  title: string;
  value: number;
  label: string;
}) {
  return (
    <div className="devon-glass rounded-[1.7rem] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#0B0D12]">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-500">{title}</p>
    </div>
  );
}