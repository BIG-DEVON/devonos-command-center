"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  Command,
  LoaderCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const steps = [
  {
    eyebrow: "Welcome to Morrow",
    title: "Welcome to your workspace.",
    body: "This short tour covers search, schedules, notifications, and access.",
    icon: Sparkles,
    accent: "#d8b76a",
    preview: "Dashboard · Search · Calendar · Settings",
  },
  {
    eyebrow: "Find anything",
    title: "People, events and work—one search.",
    body: "Open global search from the top bar or press Command K. Results include members, birthdays, events, news, projects and more.",
    icon: Search,
    accent: "#8f80ff",
    preview: "Try: Joseph, World Health Day, report…",
  },
  {
    eyebrow: "Stay ahead",
    title: "Dates arrive before they become urgent.",
    body: "Calendar, Global Events and Birthdays surface what is coming next, with the context you need to act early.",
    icon: CalendarDays,
    accent: "#5fd2a2",
    preview: "Today · Upcoming · Spotlight",
  },
  {
    eyebrow: "Notifications",
    title: "In-app, email, phone and push.",
    body: "Choose channels and quiet hours in Settings. Security controls members, sessions, recovery and every connected provider.",
    icon: BellRing,
    accent: "#ff8e7a",
    preview: "Settings → Notifications & Security",
  },
] as const;

export function MorrowOnboarding({
  displayName,
  initialOpen,
}: {
  displayName: string;
  initialOpen: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const current = steps[step];
  const Icon = current.icon;

  async function finish() {
    try {
      setSaving(true);
      setError("");
      const response = await fetch("/api/auth/onboarding", { method: "PATCH" });
      if (!response.ok) throw new Error("Morrow could not save tour progress.");
      setOpen(false);
    } catch (finishError) {
      setError(
        finishError instanceof Error
          ? finishError.message
          : "Morrow could not save tour progress."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center overflow-y-auto bg-[#07070b]/78 p-4 backdrop-blur-xl sm:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.965, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[920px] overflow-hidden rounded-[2.6rem] border border-white/50 bg-[#f7f6f1] text-[#17171b] shadow-[0_60px_180px_rgba(0,0,0,0.55)]"
      >
        <div className="grid min-h-[560px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden bg-[#0a0a0f] p-7 text-white sm:p-10">
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_18%_10%,rgba(109,93,252,0.42),transparent_36%),radial-gradient(circle_at_80%_96%,rgba(216,183,106,0.18),transparent_38%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#17171b]">M</span>Morrow</div>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">Tour {step + 1}/{steps.length}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} className="my-12">
                  <span className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/[0.08]" style={{ color: current.accent }}><Icon size={25} /></span>
                  <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: current.accent }}>{current.eyebrow}</p>
                  <div className="mt-5 rounded-[1.6rem] border border-white/[0.08] bg-white/[0.055] p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-white/35"><Command size={13} /><span className="text-[9px] font-extrabold uppercase tracking-[0.13em]">Live cue</span></div>
                    <p className="mt-3 text-sm font-extrabold leading-6 text-white/80">{current.preview}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-2">{steps.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === step ? "w-9 bg-white" : "w-3 bg-white/18"}`} />)}</div>
            </div>
          </div>

          <div className="relative flex flex-col justify-between p-7 sm:p-10 lg:p-12">
            <button type="button" onClick={() => void finish()} disabled={saving} aria-label="Skip walkthrough" className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] bg-white/70 text-slate-400 transition hover:bg-white hover:text-[#17171b]"><X size={16} /></button>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.28 }} className="my-auto pr-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6d5dfc]">{step === 0 ? `Hello, ${displayName}` : current.eyebrow}</p>
                <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl">{current.title}</h2>
                <p className="mt-6 max-w-md text-sm font-semibold leading-7 text-slate-500">{current.body}</p>
                {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</p> : null}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || saving} className="h-12 rounded-2xl px-4 text-xs font-extrabold text-slate-400 transition hover:bg-white disabled:opacity-0">Back</button>
              <button type="button" onClick={() => step === steps.length - 1 ? void finish() : setStep((value) => value + 1)} disabled={saving} className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-2xl bg-[#17171b] px-5 text-xs font-extrabold text-white shadow-[0_18px_45px_rgba(23,23,27,0.18)] transition hover:-translate-y-0.5 disabled:opacity-55">
                {saving ? <LoaderCircle size={15} className="animate-spin" /> : step === steps.length - 1 ? <><Check size={15} />Enter Morrow</> : <>Next<ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
