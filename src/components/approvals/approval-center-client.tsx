"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  History,
  MessageSquareText,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

type ApprovalStatus =
  | "Pending"
  | "Approved"
  | "Changes Requested"
  | "Rejected"
  | "Archived";
type ApprovalPriority = "Critical" | "High" | "Medium" | "Low";

type ApprovalActivity = {
  id: string;
  action: string;
  actor: string;
  detail: string;
  createdAt: string;
};

type ApprovalRequest = {
  id: string;
  title: string;
  module: string;
  sourceId: string;
  sourceLabel: string;
  sourceHref: string;
  requestedBy: string;
  approver: string;
  priority: ApprovalPriority;
  status: ApprovalStatus;
  dueDate: string;
  summary: string;
  decisionNote: string;
  requestedAt: string;
  decidedAt: string | null;
  updatedAt: string;
  activities: ApprovalActivity[];
};

type ApprovalForm = {
  title: string;
  module: string;
  sourceLabel: string;
  sourceHref: string;
  approver: string;
  priority: ApprovalPriority;
  dueDate: string;
  summary: string;
};

type ApprovalApiResponse = {
  ok: boolean;
  approvals?: ApprovalRequest[];
  approval?: ApprovalRequest;
  message?: string;
};

const emptyForm: ApprovalForm = {
  title: "",
  module: "Social Studio",
  sourceLabel: "",
  sourceHref: "/social",
  approver: "Big Devon",
  priority: "High",
  dueDate: "",
  summary: "",
};
const modules = [
  "Social Studio",
  "AI Studio",
  "Assets",
  "Projects",
  "News Intelligence",
  "Reports",
  "General",
];
const moduleHrefs: Record<string, string> = {
  "Social Studio": "/social",
  "AI Studio": "/ai",
  Assets: "/assets",
  Projects: "/projects",
  "News Intelligence": "/news",
  Reports: "/reports",
  General: "/dashboard",
};
const priorities: ApprovalPriority[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];
const statusFilters = [
  "All",
  "Pending",
  "Approved",
  "Changes Requested",
  "Rejected",
  "Archived",
] as const;

function normalizeApproval(item: Partial<ApprovalRequest>): ApprovalRequest {
  return {
    id: item.id ?? "",
    title: item.title ?? "",
    module: item.module ?? "General",
    sourceId: item.sourceId ?? "",
    sourceLabel: item.sourceLabel ?? "",
    sourceHref: item.sourceHref ?? "",
    requestedBy: item.requestedBy ?? "Big Devon",
    approver: item.approver ?? "Big Devon",
    priority: (item.priority ?? "Medium") as ApprovalPriority,
    status: (item.status ?? "Pending") as ApprovalStatus,
    dueDate: item.dueDate ?? "",
    summary: item.summary ?? "",
    decisionNote: item.decisionNote ?? "",
    requestedAt: item.requestedAt ?? new Date().toISOString(),
    decidedAt: item.decidedAt ?? null,
    updatedAt: item.updatedAt ?? new Date().toISOString(),
    activities: item.activities ?? [],
  };
}

function dateOnly(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(value: string) {
  const date = dateOnly(value);
  if (!date) return 999_999;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

function dueCopy(value: string, status: ApprovalStatus) {
  if (
    status === "Approved" ||
    status === "Rejected" ||
    status === "Archived"
  ) {
    return "Decision recorded";
  }
  const days = daysUntil(value);
  if (days === 999_999) return "No deadline";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
}

function formatDate(value: string) {
  const date = dateOnly(value);
  if (!date) return "No deadline";
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusClass(status: ApprovalStatus) {
  if (status === "Approved") {
    return "border-cyan-100 bg-cyan-50 text-cyan-700";
  }
  if (status === "Changes Requested") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  if (status === "Rejected") {
    return "border-red-100 bg-red-50 text-red-600";
  }
  if (status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }
  return "border-violet-100 bg-violet-50 text-violet-700";
}

function priorityClass(priority: ApprovalPriority) {
  if (priority === "Critical") return "text-red-600";
  if (priority === "High") return "text-amber-600";
  if (priority === "Medium") return "text-blue-600";
  return "text-slate-500";
}

export function ApprovalCenterClient() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusFilters)[number]>("All");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ApprovalForm>(emptyForm);
  const [decisionNote, setDecisionNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyDecision, setBusyDecision] = useState<ApprovalStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadApprovals() {
    try {
      setErrorMessage("");
      const response = await fetch("/api/approvals", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as ApprovalApiResponse;

      if (!response.ok || !data.ok || !data.approvals) {
        throw new Error(data.message || "Approvals could not be loaded.");
      }

      const normalized = data.approvals.map(normalizeApproval);
      setApprovals(normalized);
      setSelectedId((current) =>
        current && normalized.some((item) => item.id === current)
          ? current
          : normalized[0]?.id ?? null
      );
    } catch (error) {
      console.error("Failed to load approvals:", error);
      setErrorMessage("The Approval Center could not be loaded.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    void loadApprovals();
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return approvals.filter((approval) => {
      const matchesStatus =
        statusFilter === "All" || approval.status === statusFilter;
      const matchesSearch =
        !search ||
        [
          approval.title,
          approval.module,
          approval.approver,
          approval.requestedBy,
          approval.priority,
          approval.status,
          approval.summary,
          approval.sourceLabel,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [approvals, query, statusFilter]);

  const selected =
    approvals.find((approval) => approval.id === selectedId) ??
    filtered[0] ??
    null;
  const pending = approvals.filter(
    (approval) =>
      approval.status === "Pending" ||
      approval.status === "Changes Requested"
  );
  const overdue = pending.filter(
    (approval) => approval.dueDate && daysUntil(approval.dueDate) < 0
  ).length;
  const approved = approvals.filter(
    (approval) => approval.status === "Approved"
  ).length;
  const decided = approvals.filter((approval) =>
    ["Approved", "Rejected", "Changes Requested"].includes(approval.status)
  ).length;
  const approvalRate = decided ? Math.round((approved / decided) * 100) : 0;

  function updateForm<Key extends keyof ApprovalForm>(
    key: Key,
    value: ApprovalForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "module" && typeof value === "string"
        ? { sourceHref: moduleHrefs[value] ?? "/dashboard" }
        : {}),
    }));
  }

  async function createApproval() {
    if (!form.title.trim()) {
      setErrorMessage("Give the approval request a clear title.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as ApprovalApiResponse;

      if (!response.ok || !data.ok || !data.approval) {
        throw new Error(data.message || "Approval request could not be saved.");
      }

      const approval = normalizeApproval(data.approval);
      setApprovals((current) => [approval, ...current]);
      setSelectedId(approval.id);
      setForm(emptyForm);
      setFormOpen(false);
      setSuccessMessage("Approval request created and added to the decision queue.");
      window.dispatchEvent(new Event("devonos:notifications-changed"));
    } catch (error) {
      console.error("Failed to create approval:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Approval request could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function recordDecision(status: ApprovalStatus) {
    if (!selected) return;

    try {
      setBusyDecision(status);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await fetch(`/api/approvals/${selected.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          decisionNote,
        }),
      });
      const data = (await response.json()) as ApprovalApiResponse;

      if (!response.ok || !data.ok || !data.approval) {
        throw new Error(data.message || "Decision could not be saved.");
      }

      const approval = normalizeApproval(data.approval);
      setApprovals((current) =>
        current.map((item) => (item.id === approval.id ? approval : item))
      );
      setDecisionNote("");
      setSuccessMessage(
        status === "Approved"
          ? "Approved and recorded in the audit history."
          : status === "Changes Requested"
            ? "Changes requested and returned to the queue."
            : status === "Rejected"
              ? "Rejection recorded with its decision history."
              : "Approval archived."
      );
      window.dispatchEvent(new Event("devonos:notifications-changed"));
    } catch (error) {
      console.error("Failed to record decision:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Decision could not be saved."
      );
    } finally {
      setBusyDecision(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="devon-v2-dark-card overflow-hidden rounded-[2.75rem] p-7 text-white md:p-8">
        <div className="relative z-10 grid gap-7 xl:grid-cols-[1fr_0.9fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white/55">
              <ShieldCheck size={14} className="text-blue-200" />
              Decision control
            </div>
            <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.06em] md:text-6xl">
              Decisions that never disappear in chat.
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-white/60 md:text-base">
              Route work for review, capture the decision and rationale, and
              keep every approval attached to its source.
            </p>
            <button
              type="button"
              onClick={() => setFormOpen((open) => !open)}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#07111f] shadow-[0_18px_55px_rgba(255,255,255,0.16)] transition hover:-translate-y-0.5"
            >
              {formOpen ? <X size={17} /> : <Plus size={17} />}
              {formOpen ? "Close request form" : "New approval request"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
            <HeroMetric label="Waiting" value={pending.length} />
            <HeroMetric label="Overdue" value={overdue} />
            <HeroMetric label="Approved" value={approved} />
            <HeroMetric label="Approval rate" value={`${approvalRate}%`} />
          </div>
        </div>
      </section>

      {formOpen ? (
        <section className="devon-v2-glass rounded-[2.5rem] p-6 md:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="devon-v2-label text-blue-600">New request</p>
              <h3 className="mt-2 text-3xl tracking-[-0.04em] text-[#07111f]">
                What needs a decision?
              </h3>
            </div>
            <Sparkles size={21} className="text-violet-500" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Approval title">
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="Approve the Q3 revenue campaign"
                className="devon-input"
              />
            </Field>
            <Field label="Workspace">
              <select
                value={form.module}
                onChange={(event) => updateForm("module", event.target.value)}
                className="devon-input"
              >
                {modules.map((module) => (
                  <option key={module}>{module}</option>
                ))}
              </select>
            </Field>
            <Field label="Source label">
              <input
                value={form.sourceLabel}
                onChange={(event) =>
                  updateForm("sourceLabel", event.target.value)
                }
                placeholder="Campaign draft, project, report…"
                className="devon-input"
              />
            </Field>
            <Field label="Source link">
              <input
                value={form.sourceHref}
                onChange={(event) =>
                  updateForm("sourceHref", event.target.value)
                }
                placeholder="/social"
                className="devon-input"
              />
            </Field>
            <Field label="Approver">
              <input
                value={form.approver}
                onChange={(event) =>
                  updateForm("approver", event.target.value)
                }
                placeholder="Big Devon"
                className="devon-input"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <select
                  value={form.priority}
                  onChange={(event) =>
                    updateForm(
                      "priority",
                      event.target.value as ApprovalPriority
                    )
                  }
                  className="devon-input"
                >
                  {priorities.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </Field>
              <Field label="Decision due">
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    updateForm("dueDate", event.target.value)
                  }
                  className="devon-input"
                />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Field label="Decision context">
                <textarea
                  value={form.summary}
                  onChange={(event) => updateForm("summary", event.target.value)}
                  placeholder="Explain what is being reviewed, the recommendation, and any risks or constraints."
                  rows={4}
                  className="devon-input min-h-28 resize-y py-3"
                />
              </Field>
            </div>
          </div>

          <button
            type="button"
            onClick={createApproval}
            disabled={saving || !form.title.trim()}
            className="devon-v2-soft-button mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Send size={16} />
            {saving ? "Creating request…" : "Send for approval"}
          </button>
        </section>
      ) : null}

      {successMessage ? (
        <Feedback tone="success" message={successMessage} />
      ) : null}
      {errorMessage ? <Feedback tone="error" message={errorMessage} /> : null}

      <section className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="devon-v2-glass rounded-[2.5rem] p-5 md:p-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search decisions"
                className="h-11 w-full rounded-2xl border border-slate-950/[0.08] bg-white/75 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
              />
            </div>
            <button
              type="button"
              onClick={loadApprovals}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/75 text-slate-500 hover:text-blue-600"
              aria-label="Refresh approvals"
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div className="devon-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {statusFilters.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition ${
                  statusFilter === status
                    ? "border-[#07111f] bg-[#07111f] text-white"
                    : "border-slate-950/[0.08] bg-white/70 text-slate-500"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="devon-scrollbar mt-4 max-h-[720px] space-y-2 overflow-y-auto pr-1">
            {!loaded ? (
              <QueueEmpty
                title="Loading decision queue"
                text="Morrow is collecting your approval records."
              />
            ) : filtered.length ? (
              filtered.map((approval) => (
                <button
                  key={approval.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(approval.id);
                    setDecisionNote("");
                  }}
                  className={`w-full rounded-[1.55rem] border p-4 text-left transition ${
                    selected?.id === approval.id
                      ? "border-blue-200 bg-blue-50/75 shadow-[0_16px_45px_rgba(37,99,235,0.08)]"
                      : "border-slate-950/[0.07] bg-white/65 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${statusClass(
                            approval.status
                          )}`}
                        >
                          {approval.status}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase ${priorityClass(
                            approval.priority
                          )}`}
                        >
                          {approval.priority}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-extrabold leading-5 text-slate-800">
                        {approval.title}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold text-slate-500">
                        {approval.module} · {approval.approver}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="mt-1 shrink-0 text-slate-300"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Clock3 size={12} />
                    {dueCopy(approval.dueDate, approval.status)}
                  </div>
                </button>
              ))
            ) : (
              <QueueEmpty
                title="No approvals match"
                text="Change the filter or create a new decision request."
              />
            )}
          </div>
        </div>

        <div className="devon-v2-glass rounded-[2.5rem] p-6 md:p-7">
          {selected ? (
            <div>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${statusClass(
                        selected.status
                      )}`}
                    >
                      {selected.status}
                    </span>
                    <span
                      className={`text-[11px] font-extrabold uppercase ${priorityClass(
                        selected.priority
                      )}`}
                    >
                      {selected.priority} priority
                    </span>
                  </div>
                  <h3 className="mt-4 text-3xl leading-tight tracking-[-0.045em] text-[#07111f] md:text-4xl">
                    {selected.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                    {selected.summary || "No additional decision context supplied."}
                  </p>
                </div>
                {selected.sourceHref ? (
                  <Link
                    href={selected.sourceHref}
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/75 px-4 py-2.5 text-xs font-extrabold text-slate-600 transition hover:text-blue-600"
                  >
                    Open source
                    <ArrowUpRight size={14} />
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Detail label="Requested by" value={selected.requestedBy} />
                <Detail label="Approver" value={selected.approver} />
                <Detail
                  label="Decision due"
                  value={formatDate(selected.dueDate)}
                />
              </div>

              {selected.status === "Pending" ||
              selected.status === "Changes Requested" ? (
                <div className="mt-6 rounded-[1.8rem] border border-slate-950/[0.07] bg-white/65 p-5">
                  <div className="flex items-center gap-2">
                    <MessageSquareText size={17} className="text-blue-600" />
                    <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-500">
                      Decision note
                    </p>
                  </div>
                  <textarea
                    value={decisionNote}
                    onChange={(event) => setDecisionNote(event.target.value)}
                    placeholder="Record why this is approved, what needs changing, or why it is rejected."
                    rows={4}
                    className="mt-3 min-h-28 w-full resize-y rounded-2xl border border-slate-950/[0.08] bg-white/80 p-4 text-sm font-semibold leading-6 text-slate-700 outline-none focus:border-blue-300"
                  />
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <DecisionButton
                      icon={Check}
                      label="Approve"
                      working={busyDecision === "Approved"}
                      disabled={Boolean(busyDecision)}
                      onClick={() => void recordDecision("Approved")}
                      tone="bg-[#07111f] text-white hover:bg-blue-600"
                    />
                    <DecisionButton
                      icon={RotateCcw}
                      label="Request changes"
                      working={busyDecision === "Changes Requested"}
                      disabled={Boolean(busyDecision)}
                      onClick={() => void recordDecision("Changes Requested")}
                      tone="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    />
                    <DecisionButton
                      icon={XCircle}
                      label="Reject"
                      working={busyDecision === "Rejected"}
                      disabled={Boolean(busyDecision)}
                      onClick={() => void recordDecision("Rejected")}
                      tone="border border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                    />
                  </div>
                </div>
              ) : selected.status !== "Archived" ? (
                <div className="mt-6 rounded-[1.8rem] border border-cyan-100 bg-cyan-50/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-cyan-700"
                      />
                      <div>
                        <p className="text-sm font-extrabold text-cyan-900">
                          Decision recorded
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-cyan-800/70">
                          {selected.decisionNote ||
                            "No additional decision note was supplied."}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void recordDecision("Archived")}
                      disabled={Boolean(busyDecision)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-[10px] font-extrabold text-slate-500"
                    >
                      <Archive size={13} />
                      Archive
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-7">
                <div className="mb-3 flex items-center gap-2">
                  <History size={16} className="text-violet-600" />
                  <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-500">
                    Audit history
                  </p>
                </div>
                <div className="space-y-2">
                  {selected.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-3 rounded-[1.4rem] border border-slate-950/[0.06] bg-white/60 p-4"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row">
                          <p className="text-xs font-extrabold text-slate-700">
                            {activity.action} · {activity.actor}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400">
                            {formatDateTime(activity.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                          {activity.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <QueueEmpty
              title="No decision selected"
              text="Choose a request from the queue or create the first approval."
              large
            />
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.075] p-4">
      <p className="text-3xl font-black tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-950/[0.07] bg-white/65 p-4">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xs font-extrabold text-slate-700">{value}</p>
    </div>
  );
}

function DecisionButton({
  icon: Icon,
  label,
  working,
  disabled,
  onClick,
  tone,
}: {
  icon: ElementType;
  label: string;
  working: boolean;
  disabled: boolean;
  onClick: () => void;
  tone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-extrabold transition disabled:opacity-50 ${tone}`}
    >
      <Icon size={15} />
      {working ? "Saving…" : label}
    </button>
  );
}

function QueueEmpty({
  title,
  text,
  large = false,
}: {
  title: string;
  text: string;
  large?: boolean;
}) {
  return (
    <div className={`text-center ${large ? "py-20" : "py-12"}`}>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
        <FileCheck2 size={20} />
      </span>
      <p className="mt-4 text-sm font-extrabold text-slate-700">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs font-semibold leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function Feedback({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`flex gap-3 rounded-[1.5rem] border p-4 ${
        tone === "success"
          ? "border-cyan-100 bg-cyan-50 text-cyan-700"
          : "border-red-100 bg-red-50 text-red-600"
      }`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="text-sm font-semibold leading-6">{message}</p>
    </div>
  );
}
