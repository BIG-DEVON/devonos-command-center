"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCopy,
  Copy,
  Crown,
  FileText,
  ImageIcon,
  Lightbulb,
  MessageSquareText,
  PlaySquare,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
            } from "lucide-react";

type Platform = "Instagram" | "X" | "YouTube" | "LinkedIn" | "Facebook";

type PostStatus =
  | "Idea"
  | "Draft"
  | "Review"
  | "Approved"
  | "Posted"
  | "Archived";

type SocialDraft = {
  id: string;
  title: string;
  campaign: string;
  platform: Platform;
  status: PostStatus;
  scheduledDate: string;
  caption: string;
  visualDirection: string;
  hashtags: string;
  notes: string;
  createdAt: string;
};

type SocialForm = Omit<SocialDraft, "id" | "createdAt">;

const STORAGE_KEY = "devonos.social-drafts.v1";

const platforms: Platform[] = [
  "Instagram",
  "X",
  "YouTube",
  "LinkedIn",
  "Facebook",
];

const statuses: PostStatus[] = [
  "Idea",
  "Draft",
  "Review",
  "Approved",
  "Posted",
  "Archived",
];

const emptyForm: SocialForm = {
  title: "",
  campaign: "",
  platform: "Instagram",
  status: "Draft",
  scheduledDate: "",
  caption: "",
  visualDirection: "",
  hashtags: "",
  notes: "",
};

const starterDrafts: SocialDraft[] = [
  {
    id: "starter-tax-reform-post",
    title: "Tax Reform Awareness Post",
    campaign: "Tax Reform",
    platform: "Instagram",
    status: "Draft",
    scheduledDate: "",
    caption:
      "Clear communication strengthens public understanding. As Nigeria’s tax reform journey continues, citizens and businesses deserve simple, accessible, and reliable information.",
    visualDirection:
      "Premium white editorial card, soft shadows, refined typography, institutional but modern layout.",
    hashtags: "#TaxReform #PublicFinance #RevenueAdministration",
    notes: "Can be adapted for Instagram and X.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-presumptive-tax-video",
    title: "Presumptive Tax Explainer Caption",
    campaign: "Presumptive Tax Regulations",
    platform: "YouTube",
    status: "Review",
    scheduledDate: "",
    caption:
      "In this explainer, we break down key things taxpayers should know about the Presumptive Tax Regulations 2026 and what they mean for informal sector taxpayers, small businesses, and revenue administration.",
    visualDirection:
      "Government documentary thumbnail, clean white background, dark typography, subtle gold highlight.",
    hashtags: "#PresumptiveTax #TaxEducation #NigeriaTax",
    notes: "Use as YouTube description base.",
    createdAt: new Date().toISOString(),
  },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function platformIcon(platform: Platform) {
  if (platform === "Instagram") return Camera;
  if (platform === "YouTube") return PlaySquare;
  if (platform === "X") return MessageSquareText;
  if (platform === "LinkedIn") return Send;
  return FileText;
}

function platformClass(platform: Platform) {
  if (platform === "Instagram") {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (platform === "YouTube") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (platform === "X") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (platform === "LinkedIn") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
}

function statusClass(status: PostStatus) {
  if (status === "Posted") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "Approved") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Review") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-slate-200 bg-white text-slate-500";
}

function formatDate(dateString: string) {
  if (!dateString) return "Not scheduled";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function buildExportText(draft: SocialDraft | null) {
  if (!draft) return "Select a draft to preview and copy its caption.";

  const lines: string[] = [];

  lines.push(`${draft.title}`);
  lines.push("");
  lines.push(`Platform: ${draft.platform}`);
  lines.push(`Status: ${draft.status}`);

  if (draft.campaign) {
    lines.push(`Campaign: ${draft.campaign}`);
  }

  if (draft.scheduledDate) {
    lines.push(`Scheduled Date: ${formatDate(draft.scheduledDate)}`);
  }

  lines.push("");
  lines.push("Caption:");
  lines.push(draft.caption || "No caption added yet.");

  if (draft.hashtags) {
    lines.push("");
    lines.push("Hashtags:");
    lines.push(draft.hashtags);
  }

  if (draft.visualDirection) {
    lines.push("");
    lines.push("Visual Direction:");
    lines.push(draft.visualDirection);
  }

  if (draft.notes) {
    lines.push("");
    lines.push("Notes:");
    lines.push(draft.notes);
  }

  return lines.join("\n");
}

export function SocialStudioClient() {
  const [drafts, setDrafts] = useState<SocialDraft[]>([]);
  const [form, setForm] = useState<SocialForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setDrafts(JSON.parse(stored));
      } else {
        setDrafts(starterDrafts);
      }
    } catch {
      setDrafts(starterDrafts);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return drafts;

    return drafts.filter((draft) =>
      [
        draft.title,
        draft.campaign,
        draft.platform,
        draft.status,
        draft.caption,
        draft.visualDirection,
        draft.hashtags,
        draft.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [drafts, query]);

  const selectedDraft = useMemo(() => {
    if (!selectedId) return drafts[0] ?? null;
    return drafts.find((draft) => draft.id === selectedId) ?? null;
  }, [drafts, selectedId]);

  const approved = drafts.filter((draft) => draft.status === "Approved").length;
  const posted = drafts.filter((draft) => draft.status === "Posted").length;
  const inReview = drafts.filter((draft) => draft.status === "Review").length;
  const scheduled = drafts.filter((draft) => draft.scheduledDate).length;

  const exportText = buildExportText(selectedDraft);

  function addDraft() {
    if (!form.title.trim()) return;

    const newDraft: SocialDraft = {
      ...form,
      id: makeId(),
      title: form.title.trim(),
      campaign: form.campaign.trim(),
      caption: form.caption.trim(),
      visualDirection: form.visualDirection.trim(),
      hashtags: form.hashtags.trim(),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setDrafts((current) => [newDraft, ...current]);
    setSelectedId(newDraft.id);
    setForm(emptyForm);
  }

  function removeDraft(id: string) {
    setDrafts((current) => current.filter((draft) => draft.id !== id));

    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function updateStatus(id: string, status: PostStatus) {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, status } : draft))
    );
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <MessageSquareText size={14} className="text-[#5B5DF5]" />
                Draft Creator
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Create social media draft
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Prepare captions, campaign notes, visual directions, hashtags,
                and publishing status for each platform.
              </p>
            </div>

            <button
              onClick={addDraft}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              <Plus size={16} />
              Save Draft
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Post Title
              </span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Tax Reform Awareness Caption"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Campaign
              </span>
              <input
                value={form.campaign}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    campaign: event.target.value,
                  }))
                }
                placeholder="Tax Reform, Birthdays, Events..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Platform
              </span>
              <select
                value={form.platform}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    platform: event.target.value as Platform,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {platforms.map((platform) => (
                  <option key={platform}>{platform}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as PostStatus,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Scheduled Date
              </span>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scheduledDate: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Caption
              </span>
              <textarea
                value={form.caption}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    caption: event.target.value,
                  }))
                }
                placeholder="Write the caption here..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Visual Direction
              </span>
              <textarea
                value={form.visualDirection}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    visualDirection: event.target.value,
                  }))
                }
                placeholder="Describe the design/poster/video direction..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Hashtags
              </span>
              <input
                value={form.hashtags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hashtags: event.target.value,
                  }))
                }
                placeholder="#TaxReform #RevenueAdministration"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Notes
              </span>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Approval notes, design notes, posting instructions..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>
          </div>
        </div>

        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Crown size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                Publishing Radar
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Social command overview
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <DarkMetric value={drafts.length} label="Drafts" />
            <DarkMetric value={inReview} label="Review" />
            <DarkMetric value={approved} label="Approved" />
            <DarkMetric value={posted} label="Posted" />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              Prime note
            </p>
            <p className="mt-3 text-sm leading-6 text-white/62">
              Keep every post in draft or review until it has been checked. Once
              backend approval is added, DevonOS will record who approved each
              post.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Total Drafts"
            value={drafts.length}
            sub="Saved posts"
            icon={FileText}
          />
          <MetricCard
            title="Scheduled"
            value={scheduled}
            sub="With dates"
            icon={CalendarDays}
          />
          <MetricCard
            title="In Review"
            value={inReview}
            sub="Needs checks"
            icon={Lightbulb}
          />
          <MetricCard
            title="Posted"
            value={posted}
            sub="Published"
            icon={CheckCircle2}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Draft Library
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, select, and manage social posts.
              </p>
            </div>

            <div className="relative min-w-full md:min-w-[280px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search drafts..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {filteredDrafts.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <ImageIcon size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No drafts yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add your first social media draft and DevonOS will organize it.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => {
                const Icon = platformIcon(draft.platform);
                const isSelected = selectedDraft?.id === draft.id;

                return (
                  <div
                    key={draft.id}
                    className={`rounded-[1.65rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                      isSelected
                        ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                        : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                    }`}
                  >
                    <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <button
                        onClick={() => setSelectedId(draft.id)}
                        className="flex flex-1 gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                          <Icon size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {draft.title}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {draft.campaign || "No campaign"} ·{" "}
                            {formatDate(draft.scheduledDate)}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => removeDraft(draft.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                        aria-label="Remove draft"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${platformClass(
                          draft.platform
                        )}`}
                      >
                        {draft.platform}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                          draft.status
                        )}`}
                      >
                        {draft.status}
                      </span>
                    </div>

                    {draft.caption ? (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {draft.caption}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(draft.id, status)}
                          className="rounded-full border border-slate-950/[0.08] bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-[#0B0D12]"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#8A6B22]">
              <ClipboardCopy size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Caption Preview
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a draft and copy it.
              </p>
            </div>
          </div>

          {selectedDraft ? (
            <div className="mb-4 rounded-[1.55rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Selected draft
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#0B0D12]">
                {selectedDraft.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedDraft.platform} · {selectedDraft.status}
              </p>
            </div>
          ) : null}

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {exportText}
            </pre>
          </div>

          <button
            onClick={copyDraft}
            disabled={!selectedDraft}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DarkMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-white/38">{label}</p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string;
  value: number;
  sub: string;
  icon: ElementType;
}) {
  return (
    <div className="devon-glass rounded-[1.7rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
          <Icon size={18} />
        </div>

        <ArrowUpRight size={16} className="text-slate-300" />
      </div>

      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>
    </div>
  );
}