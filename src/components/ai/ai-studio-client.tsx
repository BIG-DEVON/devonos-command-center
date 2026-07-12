"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Copy,
  Crown,
  FileText,
  Lightbulb,
  MessageSquareText,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
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

type AiPromptRecord = {
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
};

type AiPromptForm = Omit<AiPromptRecord, "id" | "createdAt" | "output">;

const STORAGE_KEY = "devonos.ai-studio.v1";

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

const emptyForm: AiPromptForm = {
  title: "",
  category: "Caption",
  tone: "Premium",
  status: "Draft",
  instruction: "",
  sourceText: "",
  notes: "",
};

const starterPrompts: AiPromptRecord[] = [
  {
    id: "starter-caption",
    title: "Official Tax Awareness Caption",
    category: "Caption",
    tone: "Official",
    status: "Generated",
    instruction:
      "Create a clear and polished caption for a public awareness post.",
    sourceText:
      "Tax education helps citizens and businesses understand their obligations and participate confidently in national development.",
    output:
      "Clear information builds trust. Through consistent tax education, citizens and businesses can better understand their obligations, make informed decisions, and contribute confidently to national development.",
    notes: "Useful for official social media posts.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-design-prompt",
    title: "Premium Government Documentary Frame",
    category: "Design Prompt",
    tone: "Luxury",
    status: "Generated",
    instruction:
      "Create a cinematic design prompt for a government documentary frame.",
    sourceText:
      "A premium visual about digital tax payment channels and transparent revenue collection.",
    output:
      "Create an ultra-professional 4K government documentary frame showing secure digital tax payment channels and transparent revenue collection. Use a refined white, deep ink, soft platinum, blue-violet, and subtle champagne palette. The visual should feel official, calm, cinematic, and institutional, with strong negative space, clean interface elements, soft lighting, and no clutter.",
    notes: "Can be adapted for Google Flow or image generation.",
    createdAt: new Date().toISOString(),
  },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function categoryIcon(category: AiCategory) {
  if (category === "Caption") return MessageSquareText;
  if (category === "Summary") return FileText;
  if (category === "Official Message") return Crown;
  if (category === "Design Prompt") return Sparkles;
  if (category === "Video Script") return Bot;
  if (category === "Report") return Target;
  if (category === "Rewrite") return RefreshCcw;
  return Lightbulb;
}

function categoryClass(category: AiCategory) {
  if (category === "Design Prompt") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (category === "Caption") {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (category === "Video Script") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (category === "Official Message" || category === "Report") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  return "border-slate-200 bg-white text-slate-500";
}

function statusClass(status: AiStatus) {
  if (status === "Used") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "Reviewed" || status === "Generated") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function generateTemplateOutput(form: AiPromptForm) {
  const source = form.sourceText.trim();
  const instruction = form.instruction.trim();

  if (!source && !instruction) {
    return "Add an instruction or source text first, then generate a draft.";
  }

  if (form.category === "Caption") {
    return [
      source || instruction,
      "",
      "This message is designed to inform, engage, and communicate clearly with the public while maintaining a polished and professional tone.",
      "",
      "#PublicCommunication #Awareness #DevonOS",
    ].join("\n");
  }

  if (form.category === "Summary") {
    return [
      "SUMMARY",
      "",
      source || instruction,
      "",
      "Key Point:",
      "The main message should be simplified, structured, and presented in a way that is easy for leadership or the public to understand.",
    ].join("\n");
  }

  if (form.category === "Official Message") {
    return [
      "Good day,",
      "",
      source || instruction,
      "",
      "Kindly note that this message is shared for awareness, clarity, and appropriate action.",
      "",
      "Thank you.",
    ].join("\n");
  }

  if (form.category === "Design Prompt") {
    return [
      "Create an ultra-premium 4K visual based on the following concept:",
      "",
      source || instruction,
      "",
      "Use a clean white, soft platinum, deep ink, blue-violet, and subtle champagne palette. The composition should feel elegant, modern, cinematic, and highly professional. Use strong negative space, refined lighting, clean typography, and a premium institutional layout. Avoid clutter, fake logos, random data, and distorted elements.",
    ].join("\n");
  }

  if (form.category === "Video Script") {
    return [
      "VIDEO SCRIPT",
      "",
      "Opening:",
      source || instruction,
      "",
      "Middle:",
      "Explain the key idea clearly with calm pacing, strong structure, and premium documentary energy.",
      "",
      "Closing:",
      "End with a confident final line that reinforces clarity, trust, and action.",
    ].join("\n");
  }

  if (form.category === "Report") {
    return [
      "REPORT DRAFT",
      "",
      "Subject:",
      form.title || "Untitled Report",
      "",
      "Overview:",
      source || instruction,
      "",
      "Action Points:",
      "- Review the key information.",
      "- Confirm priority items.",
      "- Prepare next steps for execution.",
    ].join("\n");
  }

  if (form.category === "Rewrite") {
    return [
      "REWRITTEN VERSION",
      "",
      source || instruction,
      "",
      "Refined to sound clearer, smoother, and more professional while preserving the original meaning.",
    ].join("\n");
  }

  return [
    form.title || "Generated Draft",
    "",
    instruction || "Instruction not provided.",
    "",
    source || "Source text not provided.",
  ].join("\n");
}

function buildExportText(record: AiPromptRecord | null) {
  if (!record) return "Select a saved AI draft to preview it.";

  return [
    record.title,
    "",
    `Category: ${record.category}`,
    `Tone: ${record.tone}`,
    `Status: ${record.status}`,
    "",
    "Instruction:",
    record.instruction || "No instruction added.",
    "",
    "Source Text:",
    record.sourceText || "No source text added.",
    "",
    "Output:",
    record.output || "No output generated.",
    record.notes ? "" : "",
    record.notes ? "Notes:" : "",
    record.notes || "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function AiStudioClient() {
  const [records, setRecords] = useState<AiPromptRecord[]>([]);
  const [form, setForm] = useState<AiPromptForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOutput, setPreviewOutput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setRecords(stored ? JSON.parse(stored) : starterPrompts);
    } catch {
      setRecords(starterPrompts);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const filteredRecords = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return records;

    return records.filter((record) =>
      [
        record.title,
        record.category,
        record.tone,
        record.status,
        record.instruction,
        record.sourceText,
        record.output,
        record.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [records, query]);

  const selectedRecord = useMemo(() => {
    if (!selectedId) return records[0] ?? null;
    return records.find((record) => record.id === selectedId) ?? null;
  }, [records, selectedId]);

  const generated = records.filter(
    (record) => record.status === "Generated"
  ).length;

  const reviewed = records.filter(
    (record) => record.status === "Reviewed"
  ).length;

  const used = records.filter((record) => record.status === "Used").length;

  const designPrompts = records.filter(
    (record) => record.category === "Design Prompt"
  ).length;

  const exportText = buildExportText(selectedRecord);

  function generatePreview() {
    setPreviewOutput(generateTemplateOutput(form));
  }

  function saveRecord() {
    if (!form.title.trim()) return;

    const output = previewOutput || generateTemplateOutput(form);

    const newRecord: AiPromptRecord = {
      ...form,
      id: makeId(),
      title: form.title.trim(),
      instruction: form.instruction.trim(),
      sourceText: form.sourceText.trim(),
      notes: form.notes.trim(),
      output,
      status: "Generated",
      createdAt: new Date().toISOString(),
    };

    setRecords((current) => [newRecord, ...current]);
    setSelectedId(newRecord.id);
    setForm(emptyForm);
    setPreviewOutput("");
  }

  function removeRecord(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));

    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function updateStatus(id: string, status: AiStatus) {
    setRecords((current) =>
      current.map((record) =>
        record.id === id ? { ...record, status } : record
      )
    );
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
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
                Prompt Workspace
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Create an AI draft
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Draft captions, summaries, design prompts, scripts, reports, and
                official messages from one clean workspace.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={generatePreview}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
              >
                <Sparkles size={16} />
                Generate
              </button>

              <button
                onClick={saveRecord}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
              >
                <Plus size={16} />
                Save Draft
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Draft Title
              </span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Caption for Tax Awareness Post"
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
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as AiCategory,
                  }))
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
                  setForm((current) => ({
                    ...current,
                    tone: event.target.value as AiTone,
                  }))
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
                  setForm((current) => ({
                    ...current,
                    instruction: event.target.value,
                  }))
                }
                placeholder="Tell DevonOS what to create..."
                rows={4}
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
                  setForm((current) => ({
                    ...current,
                    sourceText: event.target.value,
                  }))
                }
                placeholder="Paste rough text, notes, article summary, script idea, or content context..."
                rows={6}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
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
                placeholder="Approval notes, usage reminders, platform notes..."
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
                Intelligence Layer
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                AI workflow prepared.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <DarkMetric value={records.length} label="Drafts" />
            <DarkMetric value={generated} label="Generated" />
            <DarkMetric value={reviewed} label="Reviewed" />
            <DarkMetric value={used} label="Used" />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              Backend note
            </p>
            <p className="mt-3 text-sm leading-6 text-white/62">
              This version uses templates. Real AI generation will be connected
              through a secure server route so your API key never touches the
              browser.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="AI Drafts"
            value={records.length}
            sub="Saved outputs"
            icon={Bot}
          />
          <MetricCard
            title="Generated"
            value={generated}
            sub="Ready to review"
            icon={Sparkles}
          />
          <MetricCard
            title="Design Prompts"
            value={designPrompts}
            sub="Visual tasks"
            icon={Lightbulb}
          />
          <MetricCard
            title="Used"
            value={used}
            sub="Applied outputs"
            icon={CheckCircle2}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Current Output
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Generate from the form, then save it to your AI archive.
              </p>
            </div>

            <button
              onClick={() => copyText(previewOutput)}
              disabled={!previewOutput}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              Copy
            </button>
          </div>

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {previewOutput || "Generated output will appear here."}
            </pre>
          </div>
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                AI Archive
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search saved prompts and generated outputs.
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

          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const Icon = categoryIcon(record.category);
              const isSelected = selectedRecord?.id === record.id;

              return (
                <div
                  key={record.id}
                  className={`rounded-[1.65rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                    isSelected
                      ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                      : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                  }`}
                >
                  <div className="mb-4 flex justify-between gap-4">
                    <button
                      onClick={() => setSelectedId(record.id)}
                      className="flex flex-1 gap-3 text-left"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                        <Icon size={18} />
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-[#0B0D12]">
                          {record.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-400">
                          {record.category} · {formatDate(record.createdAt)}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => removeRecord(record.id)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryClass(
                        record.category
                      )}`}
                    >
                      {record.category}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>

                    <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {record.tone}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                    {record.output}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(record.id, status)}
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
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Selected Draft
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Copy a saved AI draft.
              </p>
            </div>

            <button
              onClick={() => copyText(exportText)}
              disabled={!selectedRecord}
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