import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  ClipboardList,
  Globe2,
  Newspaper,
  Radio,
  Search,
  Sparkles,
} from "lucide-react";

const newsSignals = [
  {
    title: "Tax reform implementation watch",
    description:
      "Track updates around Nigeria’s tax reform implementation, revenue administration, and institutional communication signals.",
    score: "94",
  },
  {
    title: "Revenue authority monitoring",
    description:
      "Follow public mentions of revenue agencies, state tax authorities, fiscal policy, and public finance developments.",
    score: "87",
  },
  {
    title: "Digital collections & compliance",
    description:
      "Monitor stories around electronic payments, tax compliance, roadblock enforcement, and collection reforms.",
    score: "82",
  },
];

const workflow = [
  {
    title: "Paste Links",
    text: "Drop newspaper links, source names, and short notes into the collector.",
    icon: ClipboardList,
  },
  {
    title: "Generate Brief",
    text: "DevonOS formats the items into a clean internal update for your group.",
    icon: Bot,
  },
  {
    title: "Copy & Share",
    text: "Copy the final message to WhatsApp, email, or your internal channel.",
    icon: ArrowUpRight,
  },
];

export default function NewsPage() {
  return (
    <main className="px-5 py-6 md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="devon-glass devon-card-shine rounded-[2.6rem] p-6 md:p-8">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
              <Radio size={14} className="text-[#5B5DF5]" />
              News Intelligence
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
              <span className="devon-text-gradient">
                Turn public news into polished official updates.
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
              Collect tax, revenue, finance, and policy-related stories from
              newspapers or public sources, then convert them into a refined
              internal brief for communication leadership.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/news/collector"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
              >
                Open News Collector
                <ArrowUpRight size={16} />
              </Link>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/72 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white">
                Search Archive
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="devon-glass-dark devon-ink-shine rounded-[2.6rem] p-6 text-white">
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Globe2 size={23} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/38">
              Live Monitoring
            </p>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Public news radar coming online.
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/52">
              The manual collector is the first layer. Later, this section will
              listen to approved sources, classify relevance, and prepare briefs
              automatically.
            </p>

            <div className="mt-7 rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5B5DF5] opacity-70" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#5B5DF5]" />
                </span>
                <p className="text-sm font-medium text-white/68">
                  Manual intelligence workflow active
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {workflow.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="devon-glass rounded-[2rem] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_85px_rgba(15,23,42,0.11)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-[#0B0D12]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="devon-glass rounded-[2.2rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Signal Categories
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Early intelligence categories for the news system.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-500">
              <Sparkles size={14} className="text-[#8A6B22]" />
              DevonOS curated
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {newsSignals.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.6rem] border border-slate-950/[0.08] bg-white/64 p-5 shadow-[0_14px_45px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                    <Newspaper size={18} />
                  </div>

                  <span className="rounded-full border border-slate-950/[0.08] bg-slate-950/[0.035] px-3 py-1 text-xs font-semibold text-slate-500">
                    {item.score}% relevance
                  </span>
                </div>

                <h3 className="text-base font-semibold tracking-tight text-[#0B0D12]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}