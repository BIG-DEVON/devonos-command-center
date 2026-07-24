"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Copy,
  FileText,
  Lightbulb,
  MessageSquareText,
  PenLine,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";

type AiCategory =
  | "Caption"
  | "Summary"
  | "Official Message"
  | "Design Prompt"
  | "Video Script"
  | "Report"
  | "Rewrite"
  | "Other";

type AiTone =
  | "Premium"
  | "Official"
  | "Warm"
  | "Bold"
  | "Simple"
  | "Luxury"
  | "Professional";

type AiStatus = "Draft" | "Generated" | "Reviewed" | "Used" | "Archived";

type AiDraft = {
  id: string;
  title: string;
  category: AiCategory;
  tone: AiTone;
  status: AiStatus;
  instruction: string;
  sourceText: string;
  output: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type AiForm = {
  title: string;
  category: AiCategory;
  tone: AiTone;
  status: AiStatus;
  instruction: string;
  sourceText: string;
  notes: string;
};

type AiApiResponse = {
  ok: boolean;
  drafts?: AiDraft[];
  draft?: AiDraft;
  message?: string;
};

const categories: AiCategory[] = [
  "Caption",
  "Summary",
  "Official Message",
  "Design Prompt",
  "Video Script",
  "Report",
  "Rewrite",
  "Other",
];

const tones: AiTone[] = [
  "Premium",
  "Official",
  "Warm",
  "Bold",
  "Simple",
  "Luxury",
  "Professional",
];

const statuses: AiStatus[] = [
  "Draft",
  "Generated",
  "Reviewed",
  "Used",
  "Archived",
];

const emptyForm: AiForm = {
  title: "",
  category: "Caption",
  tone: "Premium",
  status: "Draft",
  instruction: "",
  sourceText: "",
  notes: "",
};

function normalizeDraft(item: Partial<AiDraft>): AiDraft {
  return {
    id: item.id ?? "",
    title: item.title ?? "",
    category: (item.category ?? "Caption") as AiCategory,
    tone: (item.tone ?? "Premium") as AiTone,
    status: (item.status ?? "Draft") as AiStatus,
    instruction: item.instruction ?? "",
    sourceText: item.sourceText ?? "",
    output: item.output ?? "",
    notes: item.notes ?? "",
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function categoryIcon(category: AiCategory) {
  if (category === "Caption") return MessageSquareText;
  if (category === "Summary") return FileText;
  if (category === "Official Message") return PenLine;
  if (category === "Design Prompt") return Sparkles;
  if (category === "Video Script") return Bot;
  if (category === "Report") return FileText;
  if (category === "Rewrite") return Wand2;
  return Lightbulb;
}

function categoryClass(category: AiCategory) {
  if (category === "Design Prompt") {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (category === "Video Script") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (category === "Official Message" || category === "Report") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
}

function toneClass(tone: AiTone) {
  if (tone === "Luxury" || tone === "Premium") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (tone === "Bold") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (tone === "Warm") {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function statusClass(status: AiStatus) {
  if (status === "Used") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "Generated" || status === "Reviewed") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
}

function generateOutputFromForm(form: AiForm) {
  const sourceBlock = form.sourceText.trim()
    ? `\n\nSOURCE CONTEXT:\n${form.sourceText.trim()}`
    : "";

  const notesBlock = form.notes.trim() ? `\n\nNOTES:\n${form.notes.trim()}` : "";

  if (form.category === "Design Prompt") {
    return [
      `${form.title || "Premium Design Prompt"}`,
      "",
      `Create a ${form.tone.toLowerCase()} visual direction with clean structure, elegant composition, cinematic depth, refined typography, and strong negative space.`,
      "",
      "Core instruction:",
      form.instruction || "Describe the desired design clearly.",
      sourceBlock,
      notesBlock,
      "",
      "Style guidance:",
      "White and blue premium visual system, tasteful accent colors, Apple-level spacing, polished lighting, no clutter, no cheap AI look, no fake logos, and no random data.",
    ].join("\n");
  }

  if (form.category === "Video Script") {
    return [
      `${form.title || "Video Script"}`,
      "",
      `Tone: ${form.tone}`,
      "",
      "Opening:",
      "Start with a clean, attention-grabbing line that frames the message clearly.",
      "",
      "Body:",
      form.instruction || "Explain the key message with structure and flow.",
      sourceBlock,
      notesBlock,
      "",
      "Closing:",
      "End with a confident, polished line that feels official, memorable, and easy to understand.",
    ].join("\n");
  }

  if (form.category === "Summary") {
    return [
      `${form.title || "Summary"}`,
      "",
      "Clean Summary:",
      form.sourceText.trim() ||
        form.instruction ||
        "Paste source text to generate a useful summary.",
      "",
      "Recommended Structure:",
      "1. What happened",
      "2. Why it matters",
      "3. What should be done next",
      notesBlock,
    ].join("\n");
  }

  return [
    `${form.title || "AI Draft"}`,
    "",
    `Category: ${form.category}`,
    `Tone: ${form.tone}`,
    "",
    "Generated Draft:",
    form.instruction || "Add an instruction to generate a stronger draft.",
    sourceBlock,
    notesBlock,
    "",
    "Refinement Direction:",
    "Make it clear, polished, premium, structured, and ready for DevonOS workflow review.",
  ].join("\n");
}

function buildDraftExport(draft: AiDraft | null) {
  if (!draft) return "Select an AI draft to preview it.";

  return [
    draft.title,
    "",
    `Category: ${draft.category}`,
    `Tone: ${draft.tone}`,
    `Status: ${draft.status}`,
    `Created: ${formatDate(draft.createdAt)}`,
    "",
    "Instruction:",
    draft.instruction || "No instruction added.",
    "",
    "Source Text:",
    draft.sourceText || "No source text added.",
    "",
    "Output:",
    draft.output || "No output generated yet.",
    "",
    "Notes:",
    draft.notes || "No notes added.",
  ].join("\n");
}

export function AiStudioClient() {
  const [drafts, setDrafts] = useState<AiDraft[]>([]);
  const [form, setForm] = useState<AiForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDrafts() {
    try {
      setErrorMessage("");

      const response = await fetch("/api/ai", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load AI drafts.");
      }

      const data = (await response.json()) as AiApiResponse;

      if (!data.ok || !data.drafts) {
        throw new Error(data.message || "AI response was invalid.");
      }

      const nextDrafts = data.drafts.map(normalizeDraft);

      setDrafts(nextDrafts);

      if (!selectedId) {
        setSelectedId(nextDrafts[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Failed to load AI drafts:", error);
      setErrorMessage("AI drafts could not be loaded from the database.");
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
        draft.category,
        draft.tone,
        draft.status,
        draft.instruction,
        draft.sourceText,
        draft.output,
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

  const generatedDrafts = drafts.filter(
    (draft) => draft.status === "Generated" || draft.output
  ).length;

  const reviewedDrafts = drafts.filter(
    (draft) => draft.status === "Reviewed"
  ).length;

  const designPrompts = drafts.filter(
    (draft) => draft.category === "Design Prompt"
  ).length;

  const currentGeneratedOutput = generateOutputFromForm(form);
  const exportText = buildDraftExport(selectedDraft);

  function updateForm<Key extends keyof AiForm>(key: Key, value: AiForm[Key]) {
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

      const output = generateOutputFromForm(form);

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          output,
          status: "Generated",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create AI draft.");
      }

      const data = (await response.json()) as AiApiResponse;

      if (!data.ok || !data.draft) {
        throw new Error(data.message || "AI response was invalid.");
      }

      const newDraft = normalizeDraft(data.draft);

      setDrafts((current) => [newDraft, ...current]);
      setSelectedId(newDraft.id);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to create AI draft:", error);
      setErrorMessage("AI draft could not be saved to the database.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: AiStatus) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/ai/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update AI draft.");
      }

      const data = (await response.json()) as AiApiResponse;

      if (!data.ok || !data.draft) {
        throw new Error(data.message || "AI response was invalid.");
      }

      const updatedDraft = normalizeDraft(data.draft);

      setDrafts((current) =>
        current.map((draft) => (draft.id === id ? updatedDraft : draft))
      );
    } catch (error) {
      console.error("Failed to update AI draft:", error);
      setErrorMessage("AI draft status could not be updated.");
    }
  }

  async function regenerateSelectedDraft() {
    if (!selectedDraft) return;

    try {
      setErrorMessage("");

      const regeneratedOutput = generateOutputFromForm({
        title: selectedDraft.title,
        category: selectedDraft.category,
        tone: selectedDraft.tone,
        status: selectedDraft.status,
        instruction: selectedDraft.instruction,
        sourceText: selectedDraft.sourceText,
        notes: selectedDraft.notes,
      });

      const response = await fetch(`/api/ai/${selectedDraft.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          output: regeneratedOutput,
          status: "Generated",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate AI draft.");
      }

      const data = (await response.json()) as AiApiResponse;

      if (!data.ok || !data.draft) {
        throw new Error(data.message || "AI response was invalid.");
      }

      const updatedDraft = normalizeDraft(data.draft);

      setDrafts((current) =>
        current.map((draft) =>
          draft.id === selectedDraft.id ? updatedDraft : draft
        )
      );
    } catch (error) {
      console.error("Failed to regenerate AI draft:", error);
      setErrorMessage("AI draft could not be regenerated.");
    }
  }

  async function removeDraft(id: string) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/ai/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete AI draft.");
      }

      setDrafts((current) => current.filter((draft) => draft.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to delete AI draft:", error);
      setErrorMessage("AI draft could not be deleted.");
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
                <Bot size={14} className="text-[#5B5DF5]" />
                AI Studio
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Create an AI draft
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Save prompts, source text, generated outputs, tone, category,
                and review notes directly into your Prisma database.
              </p>
            </div>

            <button
              onClick={addDraft}
              disabled={saving || !loaded}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? "Saving..." : "Save AI Draft"}
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
                placeholder="e.g. Premium JRB Caption / Documentary Prompt"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Category
              </span>
              <select
                value={form.category}
                onChange={(event) =>
                  updateForm("category", event.target.value as AiCategory)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tone
              </span>
              <select
                value={form.tone}
                onChange={(event) =>
                  updateForm("tone", event.target.value as AiTone)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {tones.map((tone) => (
                  <option key={tone}>{tone}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Instruction
              </span>
              <textarea
                value={form.instruction}
                onChange={(event) =>
                  updateForm("instruction", event.target.value)
                }
                placeholder="Tell DevonOS what to generate, rewrite, summarize, or design..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Source Text
              </span>
              <textarea
                value={form.sourceText}
                onChange={(event) =>
                  updateForm("sourceText", event.target.value)
                }
                placeholder="Paste raw notes, article text, meeting summary, content brief, or messy draft..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Notes
              </span>
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder="Approval notes, context, style rules, audience, platform, or reminders..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>
          </div>
        </div>

        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Wand2 size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                Current Output
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Live draft preview
              </h2>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
            <pre className="max-h-[380px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-white/72">
              {currentGeneratedOutput}
            </pre>
          </div>

          <button
            onClick={loadDrafts}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh AI Data
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="AI Drafts"
            value={drafts.length}
            sub="Database records"
            icon={Bot}
          />
          <MetricCard
            title="Generated"
            value={generatedDrafts}
            sub="Has output"
            icon={Wand2}
          />
          <MetricCard
            title="Reviewed"
            value={reviewedDrafts}
            sub="Quality checked"
            icon={CheckCircle2}
          />
          <MetricCard
            title="Design Prompts"
            value={designPrompts}
            sub="Creative prompts"
            icon={Sparkles}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                AI Draft Library
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, preview, regenerate, update, and delete database-backed
                AI drafts.
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
                placeholder="Search AI drafts..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {!loaded ? (
            <EmptyState
              icon={RefreshCcw}
              title="Loading AI drafts"
              text="Fetching records from the database."
            />
          ) : filteredDrafts.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No AI drafts found"
              text="Create your first AI draft to begin building your prompt archive."
            />
          ) : (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => {
                const Icon = categoryIcon(draft.category);
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
                            {draft.category} · {formatDate(draft.createdAt)}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => removeDraft(draft.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                        aria-label="Remove AI draft"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryClass(
                          draft.category
                        )}`}
                      >
                        {draft.category}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass(
                          draft.tone
                        )}`}
                      >
                        {draft.tone}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                          draft.status
                        )}`}
                      >
                        {draft.status}
                      </span>
                    </div>

                    {draft.instruction ? (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {draft.instruction}
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
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                AI Draft Preview
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a draft, copy it, or regenerate its stored output.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={regenerateSelectedDraft}
                disabled={!selectedDraft}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Wand2 size={16} />
                Regenerate
              </button>

              <button
                onClick={copyDraft}
                disabled={!selectedDraft}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Draft"}
              </button>
            </div>
          </div>

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {exportText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
        <Icon size={20} />
      </div>
      <h3 className="text-base font-semibold text-[#0B0D12]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
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
