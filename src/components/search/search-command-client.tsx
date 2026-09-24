"use client";

import Image from "next/image";
import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  CalendarDays,
  Check,
  Command,
  Crown,
  FileCheck2,
  Folder,
  Gauge,
  Newspaper,
  Orbit,
  Search,
  Share2,
  Sparkles,
  Target,
  UserRound,
  WandSparkles,
  Zap,
} from "lucide-react";
import { MorrowInlineLoader } from "@/components/ui/morrow-loading";
import type {
  SearchKind,
  UniversalSearchResponse,
  UniversalSearchResult,
} from "@/lib/universal-search";

const preferredKinds: SearchKind[] = [
  "People",
  "Workspace",
  "Projects",
  "KPI",
  "Social",
  "Assets",
  "Events",
  "Birthdays",
  "News",
  "Approvals",
  "Reports",
  "AI",
  "Autopilot",
  "Automations",
  "Notifications",
];

const kindIcons: Record<SearchKind, ElementType> = {
  People: UserRound,
  Workspace: Gauge,
  Projects: Briefcase,
  KPI: Target,
  Social: Share2,
  Assets: Folder,
  Events: CalendarDays,
  Birthdays: CalendarDays,
  News: Newspaper,
  Approvals: FileCheck2,
  Reports: BarChart3,
  AI: Bot,
  Autopilot: Zap,
  Automations: Orbit,
  Notifications: Bell,
};

function kindAccent(kind: SearchKind) {
  if (kind === "People") return "bg-[#f5eddb] text-[#806126]";
  if (kind === "News") return "bg-cyan-50 text-cyan-700";
  if (kind === "Approvals") return "bg-amber-50 text-amber-700";
  if (kind === "Reports") return "bg-indigo-50 text-indigo-700";
  if (kind === "Social") return "bg-pink-50 text-pink-600";
  if (kind === "Projects") return "bg-violet-50 text-violet-600";
  if (kind === "Autopilot" || kind === "Automations") {
    return "bg-[#17171b] text-white";
  }
  return "bg-[#efefff] text-[#6254e8]";
}

function formatResultDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function SearchCommandClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | SearchKind>("All");
  const [response, setResponse] = useState<UniversalSearchResponse | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const requestedQuery = new URLSearchParams(window.location.search)
      .get("q")
      ?.trim();
    if (requestedQuery) setQuery(requestedQuery);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const timer = window.setTimeout(async () => {
      try {
        const searchParams = new URLSearchParams({
          q: query,
          limit: "120",
        });
        const searchResponse = await fetch(`/api/search?${searchParams}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await searchResponse.json()) as UniversalSearchResponse;
        if (!searchResponse.ok || !data.ok) {
          throw new Error(data.message || "Search could not be refreshed.");
        }
        setResponse(data);
      } catch (searchError) {
        if (searchError instanceof DOMException && searchError.name === "AbortError") {
          return;
        }
        console.error("Universal search failed:", searchError);
        setError("Morrow could not refresh the index. Try again in a moment.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 110 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const filteredResults = useMemo(() => {
    const results = response?.results ?? [];
    if (kind === "All") return results;
    return results.filter((result) => result.kind === kind);
  }, [kind, response?.results]);

  const selectedResult = useMemo(() => {
    return (
      filteredResults.find((result) => result.id === selectedId) ??
      filteredResults[0] ??
      null
    );
  }, [filteredResults, selectedId]);

  const availableKinds = useMemo(() => {
    return preferredKinds.filter((item) => (response?.counts[item] ?? 0) > 0);
  }, [response?.counts]);

  async function copyContext() {
    if (!selectedResult) return;
    await navigator.clipboard.writeText(
      [
        selectedResult.title,
        selectedResult.subtitle,
        selectedResult.body,
        `Location: ${selectedResult.href}`,
      ]
        .filter(Boolean)
        .join("\n\n")
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-5" data-testid="universal-search">
      <section className="relative overflow-hidden rounded-[1.8rem] bg-[#0b0b10] text-white shadow-[0_24px_80px_rgba(15,15,22,0.18)]">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_78%_10%,rgba(109,93,252,0.35),transparent_32%),radial-gradient(circle_at_10%_110%,rgba(216,183,106,0.18),transparent_40%)]" />
        <div className="relative grid gap-10 p-7 md:p-10 lg:grid-cols-[1fr_0.72fr] lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.23em] text-white/55">
              <WandSparkles size={14} className="text-[#d8b76a]" />
              Workspace search
            </div>
            <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] md:text-5xl">
              Find anything in Morrow
            </h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/48">
              Search people, projects, decisions, drafts, dates, news,
              automations, and workspace records.
            </p>
          </div>

          <div className="flex items-end">
            <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.07] p-3 backdrop-blur-2xl">
              <div className="relative">
                <Search
                  size={20}
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try “Zacch”, “pending approval”, or “Lagos”…"
                  className="h-16 w-full rounded-[1.35rem] border border-white/10 bg-black/30 pl-14 pr-16 text-base font-semibold text-white outline-none transition placeholder:text-white/28 focus:border-white/24 focus:bg-black/42 focus:ring-4 focus:ring-white/[0.04]"
                  aria-label="Search everything in Morrow"
                />
                <kbd className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-white/38">
                  <Command size={10} /> K
                </kbd>
              </div>
              <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
                {loading ? (
                  <MorrowInlineLoader label="Indexing the workspace" />
                ) : (
                  <p className="text-[11px] font-semibold text-white/35">
                    {response?.indexed ?? 0} searchable objects ·{" "}
                    {response?.total ?? 0} current matches
                  </p>
                )}
                <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-[#d8b76a]/70 sm:block">
                  Ranked, not dumped
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="devon-v2-glass rounded-[2.3rem] p-3 md:p-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={kind === "All"}
            label="Everything"
            count={response?.total ?? 0}
            onClick={() => setKind("All")}
          />
          {availableKinds.map((item) => (
            <FilterButton
              key={item}
              active={kind === item}
              label={item}
              count={response?.counts[item] ?? 0}
              onClick={() => setKind(item)}
            />
          ))}
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-[1.6rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="devon-v2-glass rounded-[2.4rem] p-5 md:p-6">
          <div className="flex items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#6d5dfc]">
                Best matches
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17171b]">
                {loading
                  ? "Looking everywhere…"
                  : `${filteredResults.length} result${
                      filteredResults.length === 1 ? "" : "s"
                    }`}
              </h2>
            </div>
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="text-xs font-extrabold text-slate-400 transition hover:text-[#17171b]"
              >
                Clear query
              </button>
            ) : null}
          </div>

          <div className="devon-scrollbar mt-4 max-h-[800px] space-y-2 overflow-auto pr-1">
            {loading ? (
              <SearchLoadingRows />
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {filteredResults.length ? (
                  filteredResults.map((item, index) => (
                    <SearchResultRow
                      key={item.id}
                      result={item}
                      selected={selectedResult?.id === item.id}
                      index={index}
                      onSelect={() => setSelectedId(item.id)}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-[1.8rem] border border-dashed border-black/[0.1] bg-white/45 p-12 text-center"
                  >
                    <Search size={25} className="mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-extrabold text-[#17171b]">
                      No context matched yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-400">
                      Try a person, organisation, status, deadline, phrase, or
                      workspace name.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="xl:sticky xl:top-[92px] xl:self-start">
          <ResultSpotlight
            result={loading ? null : selectedResult}
            copied={copied}
            onCopy={() => void copyContext()}
          />
        </div>
      </section>
    </div>
  );
}

function SearchResultRow({
  result,
  selected,
  index,
  onSelect,
}: {
  result: UniversalSearchResult;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  const Icon = kindIcons[result.kind];

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.985,
        transition: { duration: 0.12, ease: "easeOut" },
      }}
      transition={{
        delay: Math.min(index * 0.015, 0.18),
        duration: 0.34,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onSelect}
      className={`group flex w-full items-center gap-4 rounded-[1.5rem] border p-3 text-left transition ${
        selected
          ? "border-[#6d5dfc]/20 bg-[#f0efff] shadow-[0_14px_44px_rgba(109,93,252,0.08)]"
          : "border-transparent bg-white/48 hover:border-black/[0.055] hover:bg-white"
      }`}
    >
      {result.imageUrl ? (
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] bg-slate-100">
          {result.imageUrl.startsWith("/") ? (
            <Image
              src={result.imageUrl}
              alt=""
              fill
              sizes="56px"
              className="object-cover object-top"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.imageUrl}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          )}
        </span>
      ) : (
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] ${kindAccent(
            result.kind
          )}`}
        >
          <Icon size={19} />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-extrabold text-[#17171b]">
            {result.title}
          </span>
          <span className="shrink-0 rounded-full bg-black/[0.04] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.11em] text-slate-400">
            {result.kind}
          </span>
        </span>
        <span className="mt-1 line-clamp-1 block text-xs font-semibold text-slate-400">
          {result.subtitle || result.body}
        </span>
      </span>

      <ArrowRight
        size={15}
        className={`shrink-0 transition ${
          selected
            ? "text-[#6d5dfc]"
            : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-[#6d5dfc]"
        }`}
      />
    </motion.button>
  );
}

function ResultSpotlight({
  result,
  copied,
  onCopy,
}: {
  result: UniversalSearchResult | null;
  copied: boolean;
  onCopy: () => void;
}) {
  if (!result) {
    return (
      <div className="overflow-hidden rounded-[2.4rem] border border-black/[0.07] bg-[#f7f5ef] p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
        <Sparkles size={24} className="mx-auto text-[#a98743]" />
        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#17171b]">
          Context appears here
        </h2>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-400">
          Search for anything and Morrow will surface the strongest matching
          record with its next action.
        </p>
      </div>
    );
  }

  const Icon = kindIcons[result.kind];
  const formattedDate = formatResultDate(result.date);

  return (
    <motion.div
      key={result.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-[2.4rem] border border-black/[0.07] bg-[#f7f5ef] shadow-[0_28px_90px_rgba(15,23,42,0.09)]"
    >
      {result.imageUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-[#11131a]">
          {result.imageUrl.startsWith("/") ? (
            <Image
              src={result.imageUrl}
              alt={`Portrait of ${result.title}`}
              fill
              sizes="(min-width: 1280px) 42vw, 100vw"
              className="object-cover object-top"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.imageUrl}
              alt={`Portrait of ${result.title}`}
              className="h-full w-full object-cover object-top"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10]/72 via-transparent to-transparent" />
          <span className="absolute bottom-5 left-5 rounded-full border border-white/18 bg-black/30 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur-xl">
            {result.kind}
          </span>
        </div>
      ) : (
        <div className="flex h-36 items-center justify-between bg-[#0b0b10] px-7 text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/[0.07] text-[#d8b76a]">
            <Icon size={25} />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">
            {result.kind}
          </span>
        </div>
      )}

      <div className="p-7 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em] ${kindAccent(
              result.kind
            )}`}
          >
            {result.status || result.kind}
          </span>
          {formattedDate ? (
            <span className="rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
              {formattedDate}
            </span>
          ) : null}
        </div>

        <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#17171b] md:text-5xl">
          {result.title}
        </h2>
        <p className="mt-4 text-sm font-extrabold leading-6 text-[#8a6b2d]">
          {result.subtitle}
        </p>
        <p className="mt-5 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-500">
          {result.body || "This record has no additional preview text yet."}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/[0.07] bg-white/80 px-5 py-3.5 text-sm font-extrabold text-[#17171b] transition hover:-translate-y-0.5 hover:bg-white"
          >
            {copied ? <Check size={16} /> : <Crown size={16} />}
            {copied ? "Context copied" : "Copy context"}
          </button>
          <Link
            href={result.href}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b0b10] px-5 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
          >
            {result.actionLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold transition ${
        active
          ? "bg-[#17171b] text-white shadow-[0_12px_30px_rgba(23,23,27,0.14)]"
          : "border border-black/[0.06] bg-white/65 text-slate-500 hover:bg-white hover:text-[#17171b]"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[9px] ${
          active ? "bg-white/10" : "bg-black/[0.04]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function SearchLoadingRows() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading search results">
      {[0, 1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 rounded-[1.5rem] bg-white/45 p-3"
        >
          <div className="h-14 w-14 rounded-[1rem] bg-black/[0.045]" />
          <div className="flex-1 space-y-2">
            <div className="morrow-skeleton-line h-3 w-2/5 overflow-hidden rounded-full bg-black/[0.045]" />
            <div className="morrow-skeleton-line h-2.5 w-3/4 overflow-hidden rounded-full bg-black/[0.035]" />
          </div>
        </div>
      ))}
    </div>
  );
}
