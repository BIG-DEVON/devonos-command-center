"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Folder,
  Newspaper,
  RefreshCcw,
  Share2,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

type DashboardMetrics = {
  kpis: number;
  completedKpis: number;
  delayedKpis: number;
  criticalKpis: number;
  socialDrafts: number;
  socialReview: number;
  socialApproved: number;
  socialPosted: number;
  assets: number;
  readyAssets: number;
  events: number;
  upcomingEvents: number;
  birthdays: number;
  aiDrafts: number;
  generatedAi: number;
  projects: number;
  activeProjects: number;
  criticalProjects: number;
};

type ActivityItem = {
  id: string;
  title: string;
  module: string;
  status: string;
  href: string;
  date: string;
  body: string;
};

const STORAGE_KEYS = {
  kpis: "devonos.kpis.v1",
  social: "devonos.social-drafts.v1",
  assets: "devonos.assets.v1",
  events: "devonos.global-events.v1",
  birthdays: "devonos.birthdays.v1",
  ai: "devonos.ai-studio.v1",
  projects: "devonos.projects.v1",
};

const emptyMetrics: DashboardMetrics = {
  kpis: 0,
  completedKpis: 0,
  delayedKpis: 0,
  criticalKpis: 0,
  socialDrafts: 0,
  socialReview: 0,
  socialApproved: 0,
  socialPosted: 0,
  assets: 0,
  readyAssets: 0,
  events: 0,
  upcomingEvents: 0,
  birthdays: 0,
  aiDrafts: 0,
  generatedAi: 0,
  projects: 0,
  activeProjects: 0,
  criticalProjects: 0,
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

function pickString(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = stringValue(item[key]);
    if (value.trim()) return value.trim();
  }

  return "";
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
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildMetrics(): DashboardMetrics {
  const kpis = safeReadArray(STORAGE_KEYS.kpis);
  const social = safeReadArray(STORAGE_KEYS.social);
  const assets = safeReadArray(STORAGE_KEYS.assets);
  const events = safeReadArray(STORAGE_KEYS.events);
  const birthdays = safeReadArray(STORAGE_KEYS.birthdays);
  const ai = safeReadArray(STORAGE_KEYS.ai);
  const projects = safeReadArray(STORAGE_KEYS.projects);

  return {
    kpis: kpis.length,
    completedKpis: kpis.filter((item) => item.status === "Completed").length,
    delayedKpis: kpis.filter((item) => item.status === "Delayed").length,
    criticalKpis: kpis.filter((item) => item.priority === "Critical").length,

    socialDrafts: social.length,
    socialReview: social.filter((item) => item.status === "Review").length,
    socialApproved: social.filter((item) => item.status === "Approved").length,
    socialPosted: social.filter((item) => item.status === "Posted").length,

    assets: assets.length,
    readyAssets: assets.filter(
      (item) => item.status === "Ready" || item.status === "Approved"
    ).length,

    events: events.length,
    upcomingEvents: events.filter((item) => {
      const days = getDaysUntil(pickString(item, ["date"]));
      return days >= 0 && days <= 30;
    }).length,

    birthdays: birthdays.length,

    aiDrafts: ai.length,
    generatedAi: ai.filter((item) => item.status === "Generated").length,

    projects: projects.length,
    activeProjects: projects.filter(
      (item) =>
        item.status === "Planning" ||
        item.status === "In Progress" ||
        item.status === "Review"
    ).length,
    criticalProjects: projects.filter((item) => item.priority === "Critical")
      .length,
  };
}

function buildRecentActivity(): ActivityItem[] {
  const kpis = safeReadArray(STORAGE_KEYS.kpis).map((item, index) => ({
    id: `kpi-${pickString(item, ["id"]) || index}`,
    title: pickString(item, ["title", "name", "objective"]) || "KPI Item",
    module: "KPI Command",
    status: pickString(item, ["status"]) || "Tracked",
    href: "/kpi",
    date: pickString(item, ["createdAt", "dueDate", "date"]),
    body: pickString(item, ["description", "notes", "outcome"]) || "",
  }));

  const social = safeReadArray(STORAGE_KEYS.social).map((item, index) => ({
    id: `social-${pickString(item, ["id"]) || index}`,
    title: pickString(item, ["title", "campaign"]) || "Social Draft",
    module: "Social Studio",
    status: pickString(item, ["status"]) || "Draft",
    href: "/social",
    date: pickString(item, ["createdAt", "scheduledDate"]),
    body: pickString(item, ["caption", "visualDirection", "notes"]) || "",
  }));

  const assets = safeReadArray(STORAGE_KEYS.assets).map((item, index) => ({
    id: `asset-${pickString(item, ["id"]) || index}`,
    title: pickString(item, ["name", "title"]) || "Asset Record",
    module: "Asset Library",
    status: pickString(item, ["status"]) || "Saved",
    href: "/assets",
    date: pickString(item, ["createdAt"]),
    body: pickString(item, ["notes", "tags", "project"]) || "",
  }));

  const events = safeReadArray(STORAGE_KEYS.events).map((item, index) => ({
    id: `event-${pickString(item, ["id"]) || index}`,
    title: pickString(item, ["title", "name"]) || "Event",
    module: "Events",
    status: pickString(item, ["status"]) || "Saved",
    href: "/events",
    date: pickString(item, ["createdAt", "date"]),
    body:
      pickString(item, [
        "contentAngle",
        "visualDirection",
        "captionDraft",
        "notes",
      ]) || "",
  }));

  const ai = safeReadArray(STORAGE_KEYS.ai).map((item, index) => ({
    id: `ai-${pickString(item, ["id"]) || index}`,
    title: pickString(item, ["title", "name"]) || "AI Draft",
    module: "AI Studio",
    status: pickString(item, ["status"]) || "Generated",
    href: "/ai",
    date: pickString(item, ["createdAt"]),
    body: pickString(item, ["output", "instruction", "sourceText"]) || "",
  }));

  const projects = safeReadArray(STORAGE_KEYS.projects).map((item, index) => ({
    id: `project-${pickString(item, ["id"]) || index}`,
    title: pickString(item, ["name", "title"]) || "Project",
    module: "Projects Command",
    status: pickString(item, ["status"]) || "Planning",
    href: "/projects",
    date: pickString(item, ["createdAt", "dueDate"]),
    body: pickString(item, ["objective", "deliverables", "notes"]) || "",
  }));

  return [...kpis, ...social, ...assets, ...events, ...ai, ...projects]
    .sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();

      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;

      return bTime - aTime;
    })
    .slice(0, 8);
}

function getCommandHealth(metrics: DashboardMetrics) {
  const total =
    metrics.kpis +
    metrics.socialDrafts +
    metrics.assets +
    metrics.events +
    metrics.birthdays +
    metrics.aiDrafts +
    metrics.projects;

  if (total === 0) return 0;

  const positive =
    metrics.completedKpis +
    metrics.socialApproved +
    metrics.socialPosted +
    metrics.readyAssets +
    metrics.upcomingEvents +
    metrics.generatedAi +
    metrics.activeProjects;

  return Math.min(100, Math.round((positive / Math.max(total, 1)) * 100));
}

function moduleClass(module: string) {
  if (module.includes("KPI")) {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (module.includes("Social")) {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (module.includes("Asset")) {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (module.includes("Events")) {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (module.includes("AI")) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-red-100 bg-red-50 text-red-600";
}

export function DashboardCommandClient() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [lastRefresh, setLastRefresh] = useState("");

  function refreshDashboard() {
    setMetrics(buildMetrics());
    setActivity(buildRecentActivity());

    setLastRefresh(
      new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date())
    );
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  const commandHealth = getCommandHealth(metrics);

  const totalRecords = useMemo(() => {
    return (
      metrics.kpis +
      metrics.socialDrafts +
      metrics.assets +
      metrics.events +
      metrics.birthdays +
      metrics.aiDrafts +
      metrics.projects
    );
  }, [metrics]);

  const focusItems = [
    {
      title: "Delayed KPI items",
      value: metrics.delayedKpis,
      note: "Review blockers and update execution status.",
      href: "/kpi",
      icon: Target,
    },
    {
      title: "Critical projects",
      value: metrics.criticalProjects,
      note: "Prioritize major workstreams that matter most.",
      href: "/projects",
      icon: Briefcase,
    },
    {
      title: "Posts in review",
      value: metrics.socialReview,
      note: "Move drafts toward approval or posting.",
      href: "/social",
      icon: Share2,
    },
    {
      title: "Upcoming events",
      value: metrics.upcomingEvents,
      note: "Prepare content before the date arrives.",
      href: "/events",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="devon-glass devon-card-shine rounded-[2.6rem] p-6 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Crown size={14} className="text-[#5B5DF5]" />
                DevonOS Command Center
              </div>

              <h1 className="max-w-5xl text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
                <span className="devon-text-gradient">
                  Your live command room is online.
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
                This dashboard now reads live records from your DevonOS modules
                and gives you one clean overview of work, content, assets,
                deadlines, and command health.
              </p>
            </div>

            <button
              onClick={refreshDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              <RefreshCcw size={16} />
              Refresh Dashboard
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <HeroMetric title="Total Records" value={totalRecords} />
            <HeroMetric title="Command Health" value={`${commandHealth}%`} />
            <HeroMetric title="Active Projects" value={metrics.activeProjects} />
            <HeroMetric title="Upcoming Events" value={metrics.upcomingEvents} />
          </div>

          <p className="mt-5 text-xs font-medium text-slate-400">
            Last refreshed: {lastRefresh || "Not refreshed yet"}
          </p>
        </div>

        <div className="devon-glass-dark devon-ink-shine rounded-[2.6rem] p-6 text-white">
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
            <Zap size={23} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/38">
            System Signal
          </p>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            {commandHealth}% command health
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/52">
            The dashboard score increases as work becomes completed, approved,
            posted, ready, or actively planned.
          </p>

          <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/36">
              <span>Readiness</span>
              <span>{commandHealth}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${commandHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="KPI Command"
          value={metrics.kpis}
          sub={`${metrics.completedKpis} completed · ${metrics.delayedKpis} delayed`}
          icon={Target}
          href="/kpi"
        />
        <MetricCard
          title="Social Studio"
          value={metrics.socialDrafts}
          sub={`${metrics.socialReview} review · ${metrics.socialPosted} posted`}
          icon={Share2}
          href="/social"
        />
        <MetricCard
          title="Asset Library"
          value={metrics.assets}
          sub={`${metrics.readyAssets} ready / approved`}
          icon={Folder}
          href="/assets"
        />
        <MetricCard
          title="Projects"
          value={metrics.projects}
          sub={`${metrics.activeProjects} active · ${metrics.criticalProjects} critical`}
          icon={Briefcase}
          href="/projects"
        />
        <MetricCard
          title="Events"
          value={metrics.events}
          sub={`${metrics.upcomingEvents} upcoming in 30 days`}
          icon={CalendarDays}
          href="/events"
        />
        <MetricCard
          title="Birthdays"
          value={metrics.birthdays}
          sub="Saved internal profiles"
          icon={Users}
          href="/birthdays"
        />
        <MetricCard
          title="AI Studio"
          value={metrics.aiDrafts}
          sub={`${metrics.generatedAi} generated drafts`}
          icon={Bot}
          href="/ai"
        />
        <MetricCard
          title="Reports"
          value={totalRecords}
          sub="Copy-ready command summaries"
          icon={BarChart3}
          href="/reports"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
              <Sparkles size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Focus Queue
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                What needs your attention first.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {focusItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-600">
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#0B0D12]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {item.note}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
                      {item.value}
                    </p>
                    <ArrowUpRight
                      size={16}
                      className="text-slate-300 transition group-hover:text-[#0B0D12]"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Clock size={14} className="text-[#5B5DF5]" />
                Recent Activity
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Latest saved records
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Recent items from your browser-saved DevonOS modules.
              </p>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              Search All
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {activity.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <FileText size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No recent records yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add records in your modules, then refresh the dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-[1.55rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 hover:bg-white"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#0B0D12]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-400">
                        {item.module} · {formatDate(item.date)}
                      </p>
                    </div>

                    <ArrowUpRight size={16} className="text-slate-300" />
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${moduleClass(
                        item.module
                      )}`}
                    >
                      {item.module}
                    </span>

                    <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {item.status}
                    </span>
                  </div>

                  {item.body ? (
                    <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                      {item.body}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="devon-glass rounded-[2.25rem] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#8A6B22]">
            <Newspaper size={19} />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
              Quick Launch
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Jump straight into your main command workflows.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <QuickLink title="News Collector" href="/news/collector" />
          <QuickLink title="Social Studio" href="/social" />
          <QuickLink title="Calendar" href="/calendar" />
          <QuickLink title="Reports" href="/reports" />
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#0B0D12]">
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  sub: string;
  icon: ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group devon-glass rounded-[1.7rem] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_85px_rgba(15,23,42,0.11)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
          <Icon size={18} />
        </div>

        <ArrowUpRight
          size={16}
          className="text-slate-300 transition group-hover:text-[#0B0D12]"
        />
      </div>

      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>
    </Link>
  );
}

function QuickLink({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-[1.45rem] border border-slate-950/[0.08] bg-white/66 p-4 text-sm font-semibold text-[#0B0D12] shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 hover:bg-white"
    >
      {title}
      <ArrowUpRight
        size={16}
        className="text-slate-300 transition group-hover:text-[#0B0D12]"
      />
    </Link>
  );
}