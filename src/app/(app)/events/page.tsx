import { GlobalEventsClient } from "@/components/events/global-events-client";
import { CalendarDays, Crown, Globe2, Sparkles } from "lucide-react";

export default function EventsPage() {
  return (
    <main className="px-5 py-6 md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="devon-glass devon-card-shine rounded-[2.6rem] p-6 md:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
              <Globe2 size={14} className="text-[#5B5DF5]" />
              Global Events
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
              <span className="devon-text-gradient">
                Plan content before the world starts talking.
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
              Track global observance days, public service dates, internal
              events, tax-related moments, and communication opportunities in a
              calm premium planning space.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">Plan</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Observance days
                </p>
              </div>

              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">Prepare</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Caption directions
                </p>
              </div>

              <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/62 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-slate-400">Track</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#0B0D12]">
                  Post readiness
                </p>
              </div>
            </div>
          </div>

          <div className="devon-glass-dark devon-ink-shine rounded-[2.6rem] p-6 text-white">
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Crown size={23} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/38">
              Planning Intelligence
            </p>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              A content calendar that thinks ahead.
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/52">
              DevonOS helps you see upcoming moments early, decide what is worth
              posting, and prepare messaging before pressure begins.
            </p>

            <div className="mt-7 rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center gap-3">
                <CalendarDays size={17} className="text-white/70" />
                <p className="text-sm font-medium text-white/68">
                  Automated observance database comes after backend setup.
                </p>
              </div>
            </div>
          </div>
        </div>

        <GlobalEventsClient />

        <div className="mt-6 rounded-[2rem] border border-[#D8B76A]/25 bg-[#FFF8E1]/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.055)] backdrop-blur-2xl">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8A6B22]">
              <Sparkles size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#8A6B22]">
                Later upgrade
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#8A6B22]/80">
                We’ll later add a real observance-day database, automatic yearly
                rollover, content reminders, campaign linking, and AI-generated
                caption/design prompts for each event.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}