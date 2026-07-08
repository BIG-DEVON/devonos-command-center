import Link from "next/link";
import { ArrowLeft, Bot, Newspaper, Sparkles } from "lucide-react";
import { NewsCollectorClient } from "@/components/news/news-collector-client";

export default function NewsCollectorPage() {
  return (
    <main className="px-5 py-6 md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/news"
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/72 px-4 py-2 text-xs font-semibold text-slate-500 shadow-[0_12px_40px_rgba(15,23,42,0.045)] transition duration-300 hover:bg-white hover:text-[#0B0D12]"
          >
            <ArrowLeft size={14} />
            Back to News Intelligence
          </Link>

          <div className="devon-glass devon-card-shine rounded-[2.6rem] p-6 md:p-8">
            <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                  <Newspaper size={14} className="text-[#5B5DF5]" />
                  News Collector
                </div>

                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
                  <span className="devon-text-gradient">
                    Build your daily intelligence brief.
                  </span>
                </h1>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
                  Add the relevant stories you found from newspapers or public
                  sources, then generate a polished internal update in seconds.
                </p>
              </div>

              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/72 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.055)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Mode
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <Bot size={17} className="text-[#8A6B22]" />
                  <span className="text-sm font-medium text-slate-600">
                    Manual now, AI next
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">Step 1</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Paste news details
                </p>
              </div>

              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">Step 2</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Review generated brief
                </p>
              </div>

              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">Step 3</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Copy to WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>

        <NewsCollectorClient />

        <div className="mt-6 rounded-[2rem] border border-[#D8B76A]/25 bg-[#FFF8E1]/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.055)] backdrop-blur-2xl">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8A6B22]">
              <Sparkles size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#8A6B22]">
                Next upgrade after this
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#8A6B22]/80">
                We will connect AI extraction so you can paste only the link,
                then DevonOS will attempt to fetch the title, source, and
                article summary automatically.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}