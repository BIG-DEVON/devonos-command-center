"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  Copy,
  FileText,
  MessageSquareText,
  PlaySquare,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Share2,
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
  updatedAt: string;
};

type SocialForm = {
  title: string;
  campaign: string;
  platform: Platform;
  status: PostStatus;
  scheduledDate: string;
  caption: string;
  visualDirection: string;
  hashtags: string;
  notes: string;
};

type SocialApiResponse = {
  ok: boolean;
  drafts?: SocialDraft[];
  draft?: SocialDraft;
  message?: string;
};

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

function normalizeDraft(item: Partial<SocialDraft>): SocialDraft {
  return {
    id: item.id ?? "",
    title: item.title ?? "",
    campaign: item.campaign ?? "",
    platform: (item.platform ?? "Instagram") as Platform,
    status: (item.status ?? "Draft") as PostStatus,
    scheduledDate: item.scheduledDate ?? "",
    caption: item.caption ?? "",
    visualDirection: item.visualDirection ?? "",
    hashtags: item.hashtags ?? "",
    notes: item.notes ?? "",
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
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
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (platform === "LinkedIn") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
}

function statusClass(status: PostStatus) {
  if (status === "Posted") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "Approved" || status === "Review") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
}

function formatDate(dateString: string) {
  if (!dateString) return "No date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "No date";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildExportText(draft: SocialDraft | null) {
  if (!draft) return "Select a social draft to preview it.";

  return [
    draft.title,
    "",
    `Campaign: ${draft.campaign || "No campaign"}`,
    `Platform: ${draft.platform}`,
    `Status: ${draft.status}`,
    `Scheduled Date: ${formatDate(draft.scheduledDate)}`,
    "",
    "Caption:",
    draft.caption || "No caption added.",
    "",
    "Visual Direction:",
    draft.visualDirection || "No visual direction added.",
    "",
    "Hashtags:",
    draft.hashtags || "No hashtags added.",
    "",
    "Notes:",
    draft.notes || "No notes added.",
  ].join("\n");
}

export function SocialStudioClient() {
  const [drafts, setDrafts] = useState<SocialDraft[]>([]);
  const [form, setForm] = useState<SocialForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDrafts() {
    try {
      setErrorMessage("");

      const response = await fetch("/api/social", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load social drafts.");
      }

      const data = (await response.json()) as SocialApiResponse;

      if (!data.ok || !data.drafts) {
        throw new Error(data.message || "Social response was invalid.");
      }

      const nextDrafts = data.drafts.map(normalizeDraft);

      setDrafts(nextDrafts);

      if (!selectedId) {
        setSelectedId(nextDrafts[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Failed to load social drafts:", error);
      setErrorMessage("Social drafts could not be loaded from the database.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDrafts = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return drafts;

    return drafts.filter((draft) =>
      [
        draft.title,
        draft.campaign,
        draft.platform,
        draft.status,
        draft.scheduledDate,
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
    if (!selectedId) return filteredDrafts[0] ?? null;

    return (
      drafts.find((draft) => draft.id === selectedId) ??
      filteredDrafts[0] ??
      null
    );
  }, [drafts, filteredDrafts, selectedId]);

  const reviewDrafts = drafts.filter((draft) => draft.status === "Review").length;
  const approvedDrafts = drafts.filter(
    (draft) => draft.status === "Approved"
  ).length;
  const postedDrafts = drafts.filter((draft) => draft.status === "Posted").length;
  const scheduledDrafts = drafts.filter((draft) => draft.scheduledDate).length;

  const exportText = buildExportText(selectedDraft);

  function updateForm<Key extends keyof SocialForm>(
    key: Key,
    value: SocialForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrorMessage("");
  }

  async function addDraft() {
    if (!form.title.trim()) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create social draft.");
      }

      const data = (await response.json()) as SocialApiResponse;

      if (!data.ok || !data.draft) {
        throw new Error(data.message || "Social response was invalid.");
      }

      const newDraft = normalizeDraft(data.draft);

      setDrafts((current) => [newDraft, ...current]);
      setSelectedId(newDraft.id);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to create social draft:", error);
      setErrorMessage("Social draft could not be saved to the database.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: PostStatus) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/social/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update social draft.");
      }

      const data = (await response.json()) as SocialApiResponse;

      if (!data.ok || !data.draft) {
        throw new Error(data.message || "Social response was invalid.");
      }

      const updatedDraft = normalizeDraft(data.draft);

      setDrafts((current) =>
        current.map((draft) => (draft.id === id ? updatedDraft : draft))
      );
    } catch (error) {
      console.error("Failed to update social draft:", error);
      setErrorMessage("Social draft status could not be updated.");
    }
  }

  async function removeDraft(id: string) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/social/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete social draft.");
      }

      setDrafts((current) => current.filter((draft) => draft.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to delete social draft:", error);
      setErrorMessage("Social draft could not be deleted.");
    }
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Share2 size={14} className="text-[#5B5DF5]" />
                Social Draft Intake
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Create a social draft
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Draft captions, campaign notes, hashtags, visual direction, and
                platform status directly into your Prisma database.
              </p>
            </div>

            <button
              onClick={addDraft}
              disabled={saving || !loaded}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>

          {errorMessage ? (
            <div className="mb-5 rounded-[1.4rem] border border-red-100 bg-red-50 p-4 text-red-600">
              <div className="flex gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm leading-6">{errorMessage}</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Draft Title
              </span>
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="e.g. Tax Reform Awareness Post"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Campaign
              </span>
              <input
                value={form.campaign}
                onChange={(event) => updateForm("campaign", event.target.value)}
                placeholder="e.g. Presumptive Tax Awareness"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Scheduled Date
              </span>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(event) =>
                  updateForm("scheduledDate", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Platform
              </span>
              <select
                value={form.platform}
                onChange={(event) =>
                  updateForm("platform", event.target.value as Platform)
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
                  updateForm("status", event.target.value as PostStatus)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Caption
              </span>
              <textarea
                value={form.caption}
                onChange={(event) => updateForm("caption", event.target.value)}
                placeholder="Write the post caption here..."
                rows={6}
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
                  updateForm("visualDirection", event.target.value)
                }
                placeholder="Describe the visual, design style, frame idea, or creative direction..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Hashtags
              </span>
              <input
                value={form.hashtags}
                onChange={(event) => updateForm("hashtags", event.target.value)}
                placeholder="#TaxAwareness #PublicCommunication"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Notes
              </span>
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder="Approval notes, posting instructions, or internal comments..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>
          </div>
        </div>

        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Share2 size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                Publishing Signal
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {drafts.length} database drafts
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <DarkMetric value={reviewDrafts} label="Review" />
            <DarkMetric value={approvedDrafts} label="Approved" />
            <DarkMetric value={postedDrafts} label="Posted" />
            <DarkMetric value={scheduledDrafts} label="Scheduled" />
          </div>

          <button
            onClick={loadDrafts}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh Social Data
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Drafts"
            value={drafts.length}
            sub="Database records"
            icon={FileText}
          />
          <MetricCard
            title="Review"
            value={reviewDrafts}
            sub="Needs approval"
            icon={Sparkles}
          />
          <MetricCard
            title="Approved"
            value={approvedDrafts}
            sub="Ready to post"
            icon={CheckCircle2}
          />
          <MetricCard
            title="Posted"
            value={postedDrafts}
            sub="Published"
            icon={Send}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Social Draft Library
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, preview, update, and delete database-backed social
                drafts.
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
                placeholder="Search social drafts..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {!loaded ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <RefreshCcw size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                Loading social drafts
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fetching records from the database.
              </p>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <Share2 size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No social drafts found
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add your first social draft to start tracking content.
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
                        aria-label="Remove social draft"
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

                      {draft.scheduledDate ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          <CalendarDays size={12} className="mr-1 inline" />
                          {formatDate(draft.scheduledDate)}
                        </span>
                      ) : null}
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
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Draft Preview
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a draft and copy its full content package.
              </p>
            </div>

            <button
              onClick={copyDraft}
              disabled={!selectedDraft}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Draft"}
            </button>
          </div>

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {exportText}
            </pre>
          </div>
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