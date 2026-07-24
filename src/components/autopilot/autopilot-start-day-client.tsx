"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ListTodo,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";

type StartDayResponse = {
  ok: boolean;
  message?: string;
  createdTasks?: number;
  skippedTasks?: number;
  health?: "critical" | "attention" | "stable";
  href?: string;
  taskHref?: string;
};

function healthClass(health?: StartDayResponse["health"]) {
  if (health === "critical") return "border-red-100 bg-red-50 text-red-600";
  if (health === "attention") return "border-blue-100 bg-blue-50 text-blue-600";
  return "border-cyan-100 bg-cyan-50 text-cyan-600";
}

export function AutopilotStartDayClient() {
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<StartDayResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function startMyDay() {
    try {
      setWorking(true);
      setErrorMessage("");
      setResult(null);

      const response = await fetch("/api/autopilot/start-day", {
        method: "POST",
      });

      const data = (await response.json()) as StartDayResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Start My Day failed.");
      }

      setResult(data);
    } catch (error) {
      console.error("Start My Day failed:", error);
      setErrorMessage("DevonOS could not complete Start My Day.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="devon-v2-dark-card rounded-[2.75rem] p-7 text-white md:p-8">
      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white/55">
            <Rocket size={14} className="text-blue-200" />
            Start My Day
          </div>

          <h2 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-6xl">
            Start with a clear plan.
          </h2>

          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-white/62 md:text-lg">
            Scan the current signals, create only the missing tasks, and prepare
            a focused daily mission plan.
          </p>

          <button
            onClick={startMyDay}
            disabled={working}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-[#07111f] shadow-[0_18px_55px_rgba(255,255,255,0.16)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Sparkles size={17} />
            {working ? "Preparing your day…" : "Start my day"}
          </button>
        </div>

        <div className="rounded-[2.1rem] border border-white/10 bg-white/[0.075] p-5 backdrop-blur-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600">
              <Zap size={22} />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/36">
                Autopilot Result
              </p>
              <p className="mt-1 text-lg font-extrabold text-white">
                {working ? "Working..." : result ? "Complete" : "Ready"}
              </p>
            </div>
          </div>

          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-extrabold uppercase ${healthClass(
                  result.health
                )}`}
              >
                {result.health ?? "stable"}
              </div>

              <p className="text-sm font-semibold leading-7 text-white/68">
                {result.message}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <MiniResult
                  icon={ListTodo}
                  value={result.createdTasks ?? 0}
                  label="Created"
                />
                <MiniResult
                  icon={CheckCircle2}
                  value={result.skippedTasks ?? 0}
                  label="Skipped"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href="/autopilot"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#07111f] transition duration-300 hover:-translate-y-0.5"
                >
                  View Tasks
                  <ArrowUpRight size={15} />
                </Link>

                <Link
                  href="/ai"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.075] px-4 py-3 text-sm font-extrabold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/12"
                >
                  Open AI Plan
                  <Bot size={15} />
                </Link>
              </div>
            </motion.div>
          ) : errorMessage ? (
            <div className="rounded-[1.5rem] border border-red-400/20 bg-red-500/10 p-4 text-red-100">
              <div className="flex gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-semibold leading-6">
                  {errorMessage}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold leading-7 text-white/58">
              Click Start My Day and DevonOS will prepare the work queue and
              daily mission plan for you.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function MiniResult({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof ListTodo;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.075] p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-blue-600">
        <Icon size={16} />
      </div>

      <p className="devon-v2-stat text-4xl text-white">{value}</p>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-white/36">
        {label}
      </p>
    </div>
  );
}
