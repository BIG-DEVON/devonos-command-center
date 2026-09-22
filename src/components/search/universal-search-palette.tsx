"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ElementType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  CalendarDays,
  Command,
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
  X,
  Zap,
} from "lucide-react";
import { MorrowInlineLoader } from "@/components/ui/morrow-loading";
import type {
  SearchKind,
  UniversalSearchResponse,
  UniversalSearchResult,
} from "@/lib/universal-search";

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

export function UniversalSearchPalette({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<UniversalSearchResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ q: query, limit: "18" });
        const searchResponse = await fetch(`/api/search?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await searchResponse.json()) as UniversalSearchResponse;
        if (!searchResponse.ok || !data.ok) throw new Error(data.message);
        setResponse(data);
        setActiveIndex(0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Command search failed:", error);
        setResponse({
          ok: false,
          query,
          total: 0,
          indexed: 0,
          results: [],
          counts: {},
          message: "Search is temporarily unavailable.",
        });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 90 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const results = useMemo(() => response?.results ?? [], [response?.results]);

  function openResult(result: UniversalSearchResult) {
    onClose();
    router.push(result.href);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-[#0b0b10]/32 px-3 pt-[6vh] backdrop-blur-md sm:px-4 sm:pt-[11vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search everything in Morrow"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="w-full max-w-[760px] overflow-hidden rounded-[2rem] border border-white/65 bg-[#fbfbfc]/96 shadow-[0_40px_140px_rgba(0,0,0,0.3)] backdrop-blur-3xl">
        <div className="flex items-center gap-3 border-b border-black/[0.06] px-5">
          <Search size={20} className="text-[#6d5dfc]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) =>
                  Math.min(index + 1, results.length - 1)
                );
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
              }
              if (event.key === "Enter" && results[activeIndex]) {
                event.preventDefault();
                openResult(results[activeIndex]);
              }
              if (event.key === "Escape") onClose();
            }}
            placeholder="Search a person, project, draft, decision, date…"
            className="h-[68px] flex-1 bg-transparent text-base font-semibold text-[#25252a] outline-none placeholder:text-[#a5a5ac]"
            aria-label="Universal search"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-black/[0.07] bg-white text-[#8f8f97]"
            aria-label="Close search"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-black/[0.05] bg-black/[0.018] px-5 py-3">
          {loading ? (
            <MorrowInlineLoader label="Searching every workspace" />
          ) : (
            <p className="text-[11px] font-semibold text-[#8f8f97]">
              {response?.total ?? 0} matches across {response?.indexed ?? 0}{" "}
              indexed objects
            </p>
          )}
          <span className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b1a36e] sm:inline-flex">
            <Sparkles size={12} />
            Ranked context
          </span>
        </div>

        <div className="devon-scrollbar max-h-[510px] overflow-y-auto p-2">
          {!loading && results.length ? (
            results.map((item, index) => {
              const Icon = kindIcons[item.kind];
              const active = index === activeIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => openResult(item)}
                  className={`group flex w-full items-center gap-3 rounded-[1.25rem] p-3 text-left transition ${
                    active ? "bg-[#efefff]" : "hover:bg-black/[0.035]"
                  }`}
                >
                  {item.imageUrl ? (
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.9rem] bg-slate-100">
                      {item.imageUrl.startsWith("/") ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover object-top"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-cover object-top"
                        />
                      )}
                    </span>
                  ) : (
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.9rem] border shadow-sm ${
                        active
                          ? "border-[#6d5dfc]/10 bg-white text-[#6d5dfc]"
                          : "border-black/[0.05] bg-white text-[#777780]"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-extrabold text-[#303036]">
                        {item.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-black/[0.04] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#92929a]">
                        {item.kind}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-xs font-medium text-[#96969e]">
                      {item.subtitle || item.body}
                    </span>
                  </span>

                  <ArrowRight
                    size={15}
                    className={`shrink-0 transition ${
                      active
                        ? "translate-x-0.5 text-[#6d5dfc]"
                        : "text-[#b9b9c0] group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })
          ) : loading ? (
            <div className="space-y-2 p-1">
              {[0, 1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[1.25rem] p-3"
                >
                  <div className="h-12 w-12 rounded-[0.9rem] bg-black/[0.04]" />
                  <div className="flex-1 space-y-2">
                    <div className="morrow-skeleton-line h-3 w-2/5 overflow-hidden rounded-full bg-black/[0.05]" />
                    <div className="morrow-skeleton-line h-2.5 w-3/4 overflow-hidden rounded-full bg-black/[0.035]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <Search size={22} className="mx-auto text-[#c5c5cb]" />
              <p className="mt-4 text-sm font-extrabold text-[#404046]">
                Nothing matched that yet
              </p>
              <p className="mt-2 text-xs font-semibold text-[#9999a1]">
                Try a name, status, organisation, phrase, or workspace.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-black/[0.055] px-5 py-3 text-[10px] font-semibold text-[#a0a0a8]">
          <span className="flex items-center gap-3">
            <span>↑↓ Move</span>
            <span>↵ Open</span>
            <span>Esc Close</span>
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Command size={10} /> K anywhere
          </span>
        </div>
      </div>
    </div>
  );
}
