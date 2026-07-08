"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clipboard,
  Copy,
  Link2,
  Newspaper,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

type NewsItem = {
  id: string;
  headline: string;
  source: string;
  url: string;
  summary: string;
  relevance: "High" | "Medium" | "Low";
};

const createItem = (): NewsItem => ({
  id: crypto.randomUUID(),
  headline: "",
  source: "",
  url: "",
  summary: "",
  relevance: "High",
});

function formatDate() {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function NewsCollectorClient() {
  const [items, setItems] = useState<NewsItem[]>([createItem()]);
  const [copied, setCopied] = useState(false);
  const [intro, setIntro] = useState(
    "Good morning distinguished members, kindly find below today’s relevant tax, revenue, and public finance news updates."
  );
  const [closing, setClosing] = useState("Thank you.");

  const completedItems = useMemo(() => {
    return items.filter(
      (item) => item.headline.trim() || item.source.trim() || item.url.trim()
    );
  }, [items]);

  const brief = useMemo(() => {
    const lines: string[] = [];

    lines.push(`DAILY NEWS BRIEF`);
    lines.push(`${formatDate()}`);
    lines.push("");
    lines.push(intro.trim());
    lines.push("");

    if (completedItems.length === 0) {
      lines.push("No news items have been added yet.");
    } else {
      completedItems.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.headline || "Untitled news item"}`);

        if (item.source) {
          lines.push(`Source: ${item.source}`);
        }

        if (item.relevance) {
          lines.push(`Relevance: ${item.relevance}`);
        }

        if (item.summary) {
          lines.push(`Summary: ${item.summary}`);
        }

        if (item.url) {
          lines.push(`Link: ${item.url}`);
        }

        lines.push("");
      });
    }

    lines.push(closing.trim());

    return lines.join("\n");
  }, [completedItems, intro, closing]);

  function updateItem(id: string, data: Partial<NewsItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  }

  function addItem() {
    setItems((current) => [...current, createItem()]);
  }

  function removeItem(id: string) {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      return next.length ? next : [createItem()];
    });
  }

  async function copyBrief() {
    await navigator.clipboard.writeText(brief);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Clipboard size={14} className="text-[#5B5DF5]" />
                Manual News Collector
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add today’s news items
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Paste links, headlines, sources, and short summaries. DevonOS
                will format them into a clean internal update.
              </p>
            </div>

            <button
              onClick={addItem}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              <Plus size={16} />
              Add News
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[1.75rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                      <Newspaper size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0B0D12]">
                        News Item {index + 1}
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        Source, link, and summary
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                    aria-label="Remove news item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Headline
                    </span>
                    <input
                      value={item.headline}
                      onChange={(event) =>
                        updateItem(item.id, { headline: event.target.value })
                      }
                      placeholder="Enter news headline"
                      className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Source
                    </span>
                    <input
                      value={item.source}
                      onChange={(event) =>
                        updateItem(item.id, { source: event.target.value })
                      }
                      placeholder="Punch, Vanguard, ThisDay..."
                      className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Link
                    </span>
                    <div className="relative">
                      <Link2
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      />
                      <input
                        value={item.url}
                        onChange={(event) =>
                          updateItem(item.id, { url: event.target.value })
                        }
                        placeholder="https://..."
                        className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Relevance
                    </span>
                    <select
                      value={item.relevance}
                      onChange={(event) =>
                        updateItem(item.id, {
                          relevance: event.target.value as NewsItem["relevance"],
                        })
                      }
                      className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Short Summary
                    </span>
                    <textarea
                      value={item.summary}
                      onChange={(event) =>
                        updateItem(item.id, { summary: event.target.value })
                      }
                      placeholder="Write a short official summary of the news..."
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
              Message Settings
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Adjust the opening and closing lines of the brief.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Opening Message
              </span>
              <textarea
                value={intro}
                onChange={(event) => setIntro(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Closing Message
              </span>
              <input
                value={closing}
                onChange={(event) => setClosing(event.target.value)}
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="xl:sticky xl:top-24 xl:h-fit">
        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-xs font-semibold text-white/56">
                <Sparkles size={14} />
                Generated Brief
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Ready-to-send update
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/48">
                Copy this into WhatsApp, email, or your internal channel.
              </p>
            </div>

            <button
              onClick={copyBrief}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="rounded-[1.55rem] border border-white/10 bg-black/25 p-4">
            <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-white/74">
              {brief}
            </pre>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              Current Brief Stats
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-2xl font-semibold">{completedItems.length}</p>
                <p className="mt-1 text-xs text-white/38">Items</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {
                    completedItems.filter((item) => item.relevance === "High")
                      .length
                  }
                </p>
                <p className="mt-1 text-xs text-white/38">High</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{brief.length}</p>
                <p className="mt-1 text-xs text-white/38">Chars</p>
              </div>
            </div>
          </div>

          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-semibold text-white/68 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.09] hover:text-white">
            AI summarization coming next
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}