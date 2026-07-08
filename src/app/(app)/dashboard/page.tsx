import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Cake,
  CircleAlert,
  Newspaper,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

const stats = [
  {
    title: "News Signals",
    value: "12",
    label: "Relevant items found today",
    icon: Newspaper,
    accent: "text-[#5B5DF5]",
    bg: "bg-[#EEF2FF]",
  },
  {
    title: "KPI Progress",
    value: "78%",
    label: "Department completion rate",
    icon: Target,
    accent: "text-[#8A6B22]",
    bg: "bg-[#FFF8E1]",
  },
  {
    title: "Birthdays",
    value: "3",
    label: "Upcoming this week",
    icon: Cake,
    accent: "text-[#C026D3]",
    bg: "bg-[#FDF4FF]",
  },
  {
    title: "Events",
    value: "9",
    label: "Notable days ahead",
    icon: CalendarDays,
    accent: "text-[#2563EB]",
    bg: "bg-[#EFF6FF]",
  },
];

const intelligence = [
  {
    title: "Tax reform implementation continues across revenue institutions.",
    meta: "High relevance · Revenue Administration",
    score: "94%",
  },
  {
    title: "State revenue authorities intensify digital payment adoption.",
    meta: "Medium relevance · Digital Collections",
    score: "81%",
  },
  {
    title: "Public finance stakeholders discuss harmonised revenue collection.",
    meta: "High relevance · Policy Watch",
    score: "89%",
  },
];

const priorityActions = [
  "Generate today’s official news brief for the communications group.",
  "Review two delayed KPI items before close of work.",
  "Prepare birthday message draft for this week’s celebrants.",
];

export default function DashboardPage() {
  return (
    <main className="px-5 py-6 md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-4 xl:grid-cols-[1.42fr_0.58fr]">
          <div className="devon-glass devon-card-shine devon-premium-border rounded-[2.5rem] p-6 md:p-8">
            <div className="mb-8 flex flex-col justify-between gap-7 md:flex-row md:items-start">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                  <Sparkles size={14} className="text-[#8A6B22]" />
                  Daily Intelligence Brief
                </div>

                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
                  <span className="devon-text-gradient">
                    Good morning, Big Devon.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                  DevonOS is monitoring news, birthdays, KPIs, social drafts,
                  observance days, and communication priorities with a calm,
                  premium intelligence layer.
                </p>
              </div>

              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/72 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.055)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Live Pulse
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5B5DF5] opacity-70" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#5B5DF5]" />
                  </span>

                  <span className="text-sm font-medium text-slate-600">
                    Intelligence engine online
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">
                  Today’s brief
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0B0D12]">
                  12 signals found
                </p>
              </div>

              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">
                  Priority alert
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0B0D12]">
                  2 KPIs need attention
                </p>
              </div>

              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">
                  Celebration watch
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0B0D12]">
                  3 birthdays soon
                </p>
              </div>
            </div>
          </div>

          <div className="devon-glass-dark devon-ink-shine rounded-[2.5rem] p-6 text-white">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Zap size={24} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/38">
              Prime Suggestion
            </p>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Generate your official daily news update.
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/52">
              DevonOS can turn today’s news signals into a polished internal
              communication brief ready for your group chat.
            </p>

            <button className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100">
              Generate Brief
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="devon-glass rounded-[1.9rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-slate-950/[0.12] hover:shadow-[0_28px_85px_rgba(15,23,42,0.11)]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.accent}`}
                  >
                    <Icon size={21} />
                  </div>

                  <Activity size={18} className="text-slate-300" />
                </div>

                <p className="text-sm font-medium text-slate-400">
                  {item.title}
                </p>
                <h3 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
                  {item.value}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="devon-glass rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                  News Intelligence
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Latest tax, revenue, and public finance signals.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="space-y-3">
              {intelligence.map((item, index) => (
                <div
                  key={item.title}
                  className="group rounded-[1.45rem] border border-slate-950/[0.08] bg-white/64 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-[#5B5DF5]/20 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#5B5DF5]">
                        Signal {index + 1}
                      </p>
                      <h3 className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {item.meta}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="rounded-full border border-slate-950/[0.08] bg-slate-950/[0.035] px-2.5 py-1 text-xs font-semibold text-slate-500">
                        {item.score}
                      </span>
                      <ArrowUpRight
                        size={17}
                        className="text-slate-300 transition group-hover:text-[#5B5DF5]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="devon-glass rounded-[2rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#8A6B22]">
                <CircleAlert size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Priority Actions
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Things DevonOS thinks matter today.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {priorityActions.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[1.45rem] border border-slate-950/[0.08] bg-white/64 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B0D12] text-xs font-semibold text-white">
                      {index + 1}
                    </div>

                    <p className="text-sm font-medium leading-6 text-slate-600">
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full rounded-2xl border border-slate-950/[0.08] bg-white/72 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#0B0D12]">
              View Full Command Brief
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}