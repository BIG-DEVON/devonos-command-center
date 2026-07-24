"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Cake,
  CheckCircle2,
  Factory,
  Newspaper,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";

type FactoryDraft = {
  type: string;
  title: string;
  href: string;
};

type ContentFactoryResponse = {
  ok: boolean;
  message?: string;
  createdCount?: number;
  skippedCount?: number;
  created?: FactoryDraft[];
  skipped?: FactoryDraft[];
};

function typeIcon(type: string) {
  const lower = type.toLowerCase();

  if (lower.includes("birthday")) return Cake;
  if (lower.includes("news")) return Newspaper;

  return Send;
}

function typeClass(type: string) {
  const lower = type.toLowerCase();

  if (lower.includes("birthday")) {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (lower.includes("news")) {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  return "border-violet-100 bg-violet-50 text-violet-600";
}

export function AutopilotContentFactoryClient() {
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<ContentFactoryResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function runFactory() {
    try {
      setWorking(true);
      setErrorMessage("");
      setResult(null);

      const response = await fetch("/api/autopilot/content-factory", {
        method: "POST",
      });

      const data = (await response.json()) as ContentFactoryResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Content Factory failed.");
      }

      setResult(data);
    } catch (error) {
      console.error("Content Factory failed:", error);
      setErrorMessage("DevonOS could not create content drafts.");
    } finally {
      setWorking(false);
    }
  }

  const created = result?.created ?? [];
  const skipped = result?.skipped ?? [];

  return (
    <section className="devon-v2-glass rounded-[2.75rem] p-7 md:p-8">
      <div className="mb-7 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-violet-600">
            <Factory size={14} />
            Autopilot Content Factory
          </div>

          <h2 className="text-4xl text-[#07111f] md:text-5xl">
            Turn records into draft content.
          </h2>

          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
            DevonOS scans upcoming birthdays, upcoming events, and high-priority
            news signals, then creates ready-to-review Social Studio drafts.
          </p>
        </div>

        <div className="rounded-[2.1rem] border border-slate-950/[0.07] bg-white/70 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
              <Wand2 size={22} />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Factory Result
              </p>
              <p className="mt-1 text-lg font-extrabold text-[#07111f]">
                {working ? "Working..." : result ? "Complete" : "Ready"}
              </p>
            </div>
          </div>

          {result ? (
            <div className="grid grid-cols-2 gap-3">
              <MiniFactoryStat
                value={result.createdCount ?? 0}
                label="Created"
              />
              <MiniFactoryStat
                value={result.skippedCount ?? 0}
                label="Skipped"
              />
            </div>
          ) : (
            <p className="text-sm font-semibold leading-7 text-slate-500">
              Click the button and DevonOS will prepare draft content from your
              saved records.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={runFactory}
          disabled={working}
          className="devon-v2-soft-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold text-white transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Sparkles size={17} />
          {working ? "Creating drafts..." : "Run Content Factory"}
        </button>

        <Link
          href="/social"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/75 px-6 py-3.5 text-sm font-extrabold text-slate-600 shadow-[0_16px_48px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-blue-600"
        >
          Open Social Studio
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-red-600">
          <div className="flex gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold leading-6">{errorMessage}</p>
          </div>
        </div>
      ) : null}

      {result?.message ? (
        <div className="mt-5 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-4 text-blue-600">
          <div className="flex gap-3">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold leading-6">{result.message}</p>
          </div>
        </div>
      ) : null}

      {created.length > 0 ? (
        <div className="mt-6">
          <p className="devon-v2-label mb-3 text-blue-600">Created Drafts</p>
          <div className="grid gap-3 md:grid-cols-2">
            {created.map((draft, index) => {
              const Icon = typeIcon(draft.type);

              return (
                <motion.div
                  key={`${draft.type}-${draft.title}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.04 * index,
                    duration: 0.42,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-[1.7rem] border border-slate-950/[0.075] bg-white/70 p-4"
                >
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase ${typeClass(
                          draft.type
                        )}`}
                      >
                        {draft.type}
                      </span>

                      <p className="mt-2 text-sm font-extrabold leading-6 text-[#07111f]">
                        {draft.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : null}

      {skipped.length > 0 ? (
        <div className="mt-6">
          <p className="devon-v2-label mb-3 text-slate-400">Skipped Duplicates</p>
          <div className="grid gap-2">
            {skipped.slice(0, 8).map((draft) => (
              <div
                key={`${draft.type}-${draft.title}`}
                className="rounded-[1.3rem] border border-slate-950/[0.06] bg-white/55 px-4 py-3 text-sm font-semibold text-slate-500"
              >
                {draft.type}: {draft.title}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MiniFactoryStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-950/[0.07] bg-white/70 p-4">
      <p className="devon-v2-stat text-4xl text-[#07111f]">{value}</p>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
    </div>
  );
}