"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Copy,
  Crown,
  FileText,
  Folder,
  Keyboard,
  RefreshCcw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

type ModuleRecord = {
  title: string;
  href: string;
  description: string;
  icon: ElementType;
  storageKey?: string;
  tag: string;
};

const modules: ModuleRecord[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Return to the main DevonOS command overview.",
    icon: BarChart3,
    tag: "Overview",
  },
  {
    title: "News Intelligence",
    href: "/news",
    description: "Collect and prepare news updates for internal briefings.",
    icon: FileText,
    storageKey: "devonos.news-items.v1",
    tag: "Briefs",
  },
  {
    title: "Social Studio",
    href: "/social",
    description: "Manage captions, post ideas, approvals, and publishing status.",
    icon: Share2,
    storageKey: "devonos.social-drafts.v1",
    tag: "Publishing",
  },
  {
    title: "KPI Command",
    href: "/kpi",
    description: "Track execution, priorities, completed work, and blockers.",
    icon: Target,
    storageKey: "devonos.kpis.v1",
    tag: "Execution",
  },
  {
    title: "Events",
    href: "/events",
    description: "Plan observance days, content angles, and event messaging.",
    icon: CalendarDays,
    storageKey: "devonos.global-events.v1",
    tag: "Planning",
  },
  {
    title: "Birthdays",
    href: "/birthdays",
    description: "Manage birthday profiles, tones, and message generation.",
    icon: Users,
    storageKey: "devonos.birthdays.v1",
    tag: "Culture",
  },
  {
    title: "Asset Library",
    href: "/assets",
    description: "Organize logos, visuals, references, files, and usage notes.",
    icon: Folder,
    storageKey: "devonos.assets.v1",
    tag: "Creative",
  },
  {
    title: "Reports",
    href: "/reports",
    description: "Generate copy-ready summaries from your saved modules.",
    icon: BarChart3,
    tag: "Reports",
  },
  {
    title: "AI Studio",
    href: "/ai",
    description: "Draft captions, scripts, summaries, prompts, and messages.",
    icon: Bot,
    storageKey: "devonos.ai-studio.v1",
    tag: "AI",
  },
  {
    title: "Search",
    href: "/search",
    description: "Search across your saved DevonOS records.",
    icon: Search,
    tag: "Find",
  },
  {
    title: "Calendar",
    href: "/calendar",
    description: "View dates from events, birthdays, posts, and due items.",
    icon: CalendarDays,
    tag: "Agenda",
  },
  {
    title: "Projects",
    href: "/projects",
    description: "Control major campaigns, workstreams, and project briefs.",
    icon: Zap,
    storageKey: "devonos.projects.v1",
    tag: "Projects",
  },
];

const workflows = [
  {
    title: "Daily Communications Check",
    steps: [
      "Open News Intelligence and collect important updates.",
      "Check Calendar Command for upcoming events or deadlines.",
      "Review Social Studio drafts that need approval.",
      "Update KPI Command with completed or delayed items.",
      "Generate a quick report in Reports Command.",
    ],
  },
  {
    title: "Social Post Production",
    steps: [
      "Create or select a campaign in Projects Command.",
      "Draft the caption in Social Studio.",
      "Create the visual prompt in AI Studio.",
      "Save related files in Asset Library.",
      "Schedule or mark the post for review.",
    ],
  },
  {
    title: "Weekly Executive Brief",
    steps: [
      "Refresh Search Command and Calendar Command.",
      "Review delayed KPIs and critical projects.",
      "Check assets that are ready or still in progress.",
      "Open Reports Command and copy the generated report.",
      "Send the summary to the appropriate channel.",
    ],
  },
];

function safeReadCount(key?: string) {
  if (!key) return 0;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return 0;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function buildChecklist() {
  return [
    "DEVONOS DAILY COMMAND CHECKLIST",
    "",
    "1. Check News Intelligence for new public updates.",
    "2. Review Calendar Command for upcoming dates.",
    "3. Update KPI Command with completed, delayed, or blocked work.",
    "4. Prepare or review Social Studio drafts.",
    "5. Organize new creative files in Asset Library.",
    "6. Check Projects Command for urgent workstreams.",
    "7. Generate a command report when needed.",
    "",
    "End of checklist.",
  ].join("\n");
}

export function CommandCenterClient() {
  const [query, setQuery] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("");

  function refreshCounts() {
    const nextCounts: Record<string, number> = {};

    modules.forEach((module) => {
      nextCounts[module.href] = safeReadCount(module.storageKey);
    });

    setCounts(nextCounts);

    setLastRefresh(
      new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date())
    );
  }

  useEffect(() => {
    refreshCounts();
  }, []);

  const filteredModules = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return modules;

    return modules.filter((module) =>
      [module.title, module.description, module.tag, module.href]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query]);

  const totalRecords = Object.values(counts).reduce(
    (total, value) => total + value,
    0
  );

  async function copyChecklist() {
    await navigator.clipboard.writeText(buildChecklist());
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-5">
        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Crown size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                Command Menu
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {totalRecords} saved records indexed
              </h2>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/38"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands..."
                className="w-full rounded-2xl border border-white/10 bg-black/25 py-3.5 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-white/28 focus:border-white/25 focus:bg-black/35"
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-white/42">
              Last refreshed: {lastRefresh || "Not refreshed yet"}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={refreshCounts}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <button
              onClick={copyChecklist}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Checklist"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetricCard
            title="Modules"
            value={modules.length}
            sub="Command routes"
            icon={Keyboard}
          />
          <MetricCard
            title="Records"
            value={totalRecords}
            sub="Browser-saved data"
            icon={FileText}
          />
          <MetricCard
            title="Workflows"
            value={workflows.length}
            sub="Command routines"
            icon={Zap}
          />
          <MetricCard
            title="Ready"
            value={1}
            sub="Manual OS active"
            icon={CheckCircle2}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
              <Settings size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                System Note
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                DevonOS is currently running in local browser mode.
              </p>
            </div>
          </div>

          <p className="text-sm leading-7 text-slate-500">
            Your modules are storing records locally for now. Backend setup will
            later move everything into a real database with login, team access,
            file uploads, and protected API routes.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
              <Keyboard size={14} className="text-[#5B5DF5]" />
              Quick Launch
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
              Open any DevonOS workspace
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Use this page as your quick command launcher when the app becomes
              large.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredModules.map((module) => {
              const Icon = module.icon;
              const count = counts[module.href] ?? 0;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group rounded-[1.65rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_85px_rgba(15,23,42,0.11)]"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                      <Icon size={18} />
                    </div>

                    <ArrowUpRight
                      size={16}
                      className="text-slate-300 transition group-hover:text-[#0B0D12]"
                    />
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {module.tag}
                    </span>

                    {module.storageKey ? (
                      <span className="rounded-full border border-[#5B5DF5]/15 bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#5B5DF5]">
                        {count} records
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-base font-semibold text-[#0B0D12]">
                    {module.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {module.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#8A6B22]">
              <Sparkles size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Workflow Shortcuts
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Repeatable routines for your daily command work.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.title}
                className="rounded-[1.65rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)]"
              >
                <h3 className="text-base font-semibold text-[#0B0D12]">
                  {workflow.title}
                </h3>

                <div className="mt-4 space-y-2">
                  {workflow.steps.map((step, index) => (
                    <div key={step} className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950/[0.045] text-xs font-semibold text-slate-500">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-slate-500">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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