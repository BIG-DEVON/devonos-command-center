"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Plus,
  RefreshCcw,
  Search,
  Target,
  Trash2,
} from "lucide-react";

type KpiPriority = "Low" | "Medium" | "High" | "Critical";

type KpiStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "Delayed"
  | "Blocked";

type KpiItem = {
  id: string;
  title: string;
  owner: string;
  status: KpiStatus;
  priority: KpiPriority;
  dueDate: string;
  description: string;
  outcome: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type KpiForm = {
  title: string;
  owner: string;
  status: KpiStatus;
  priority: KpiPriority;
  dueDate: string;
  description: string;
  outcome: string;
  notes: string;
};

type KpisApiResponse = {
  ok: boolean;
  kpis?: KpiItem[];
  kpi?: KpiItem;
  message?: string;
};

const statuses: KpiStatus[] = [
  "Not Started",
  "In Progress",
  "Completed",
  "Delayed",
  "Blocked",
];

const priorities: KpiPriority[] = ["Low", "Medium", "High", "Critical"];

const emptyForm: KpiForm = {
  title: "",
  owner: "",
  status: "Not Started",
  priority: "Medium",
  dueDate: "",
  description: "",
  outcome: "",
  notes: "",
};

function normalizeKpi(item: Partial<KpiItem>): KpiItem {
  return {
    id: item.id ?? "",
    title: item.title ?? "",
    owner: item.owner ?? "",
    status: (item.status ?? "Not Started") as KpiStatus,
    priority: (item.priority ?? "Medium") as KpiPriority,
    dueDate: item.dueDate ?? "",
    description: item.description ?? "",
    outcome: item.outcome ?? "",
    notes: item.notes ?? "",
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDaysUntil(dateString: string) {
  if (!dateString) return 999999;

  const today = todayStart();
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  if (Number.isNaN(date.getTime())) return 999999;

  const diff = date.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string) {
  if (!dateString) return "No due date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "No due date";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function dueLabel(dateString: string) {
  const days = getDaysUntil(dateString);

  if (days === 999999) return "No due date";
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function statusClass(status: KpiStatus) {
  if (status === "Completed") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "In Progress") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Delayed" || status === "Blocked") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
}

function priorityClass(priority: KpiPriority) {
  if (priority === "Critical") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (priority === "High") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (priority === "Medium") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function buildKpiBrief(kpi: KpiItem | null) {
  if (!kpi) return "Select a KPI item to preview its brief.";

  return [
    kpi.title,
    "",
    `Owner: ${kpi.owner || "No owner assigned"}`,
    `Status: ${kpi.status}`,
    `Priority: ${kpi.priority}`,
    `Due Date: ${formatDate(kpi.dueDate)} (${dueLabel(kpi.dueDate)})`,
    "",
    "Description:",
    kpi.description || "No description added.",
    "",
    "Expected Outcome:",
    kpi.outcome || "No outcome added.",
    "",
    "Notes:",
    kpi.notes || "No notes added.",
  ].join("\n");
}

export function KpiCommandClient() {
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [form, setForm] = useState<KpiForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadKpis() {
    try {
      setErrorMessage("");

      const response = await fetch("/api/kpis", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load KPIs.");
      }

      const data = (await response.json()) as KpisApiResponse;

      if (!data.ok || !data.kpis) {
        throw new Error(data.message || "KPI response was invalid.");
      }

      const nextKpis = data.kpis.map(normalizeKpi);

      setKpis(nextKpis);

      if (!selectedId) {
        setSelectedId(nextKpis[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Failed to load KPIs:", error);
      setErrorMessage("KPIs could not be loaded from the database.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    loadKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredKpis = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return kpis;

    return kpis.filter((kpi) =>
      [
        kpi.title,
        kpi.owner,
        kpi.status,
        kpi.priority,
        kpi.dueDate,
        kpi.description,
        kpi.outcome,
        kpi.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [kpis, query]);

  const selectedKpi = useMemo(() => {
    if (!selectedId) return filteredKpis[0] ?? null;

    return (
      kpis.find((kpi) => kpi.id === selectedId) ??
      filteredKpis[0] ??
      null
    );
  }, [filteredKpis, kpis, selectedId]);

  const completedKpis = kpis.filter((kpi) => kpi.status === "Completed").length;

  const dueSoonKpis = kpis.filter((kpi) => {
    const days = getDaysUntil(kpi.dueDate);
    return days >= 0 && days <= 7 && kpi.status !== "Completed";
  }).length;

  const overdueKpis = kpis.filter((kpi) => {
    const days = getDaysUntil(kpi.dueDate);
    return days < 0 && kpi.status !== "Completed";
  }).length;

  const completionRate =
    kpis.length === 0 ? 0 : Math.round((completedKpis / kpis.length) * 100);

  const briefText = buildKpiBrief(selectedKpi);

  function updateForm<Key extends keyof KpiForm>(key: Key, value: KpiForm[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrorMessage("");
  }

  async function addKpi() {
    if (!form.title.trim()) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/kpis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create KPI.");
      }

      const data = (await response.json()) as KpisApiResponse;

      if (!data.ok || !data.kpi) {
        throw new Error(data.message || "KPI response was invalid.");
      }

      const newKpi = normalizeKpi(data.kpi);

      setKpis((current) => [newKpi, ...current]);
      setSelectedId(newKpi.id);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to create KPI:", error);
      setErrorMessage("KPI could not be saved to the database.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: KpiStatus) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/kpis/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update KPI.");
      }

      const data = (await response.json()) as KpisApiResponse;

      if (!data.ok || !data.kpi) {
        throw new Error(data.message || "KPI response was invalid.");
      }

      const updatedKpi = normalizeKpi(data.kpi);

      setKpis((current) =>
        current.map((kpi) => (kpi.id === id ? updatedKpi : kpi))
      );
    } catch (error) {
      console.error("Failed to update KPI:", error);
      setErrorMessage("KPI status could not be updated.");
    }
  }

  async function removeKpi(id: string) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/kpis/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete KPI.");
      }

      setKpis((current) => current.filter((kpi) => kpi.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to delete KPI:", error);
      setErrorMessage("KPI could not be deleted.");
    }
  }

  async function copyBrief() {
    await navigator.clipboard.writeText(briefText);
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
                <Target size={14} className="text-[#5B5DF5]" />
                KPI Intake
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add a KPI item
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track priorities, owners, outcomes, blockers, deadlines, and
                execution progress directly inside your Prisma database.
              </p>
            </div>

            <button
              onClick={addKpi}
              disabled={saving || !loaded}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? "Saving..." : "Save KPI"}
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
                KPI Title
              </span>
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="e.g. Complete weekly communications report"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Owner
              </span>
              <input
                value={form.owner}
                onChange={(event) => updateForm("owner", event.target.value)}
                placeholder="Devon, Communications Team..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Due Date
              </span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => updateForm("dueDate", event.target.value)}
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value as KpiStatus)
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
                Priority
              </span>
              <select
                value={form.priority}
                onChange={(event) =>
                  updateForm("priority", event.target.value as KpiPriority)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Description
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="What needs to be done?"
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Expected Outcome
              </span>
              <textarea
                value={form.outcome}
                onChange={(event) => updateForm("outcome", event.target.value)}
                placeholder="What does success look like?"
                rows={3}
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
                placeholder="Blockers, updates, approvals, or context..."
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
                KPI Command
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {completionRate}% completion signal
              </h2>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/36">
              <span>Execution</span>
              <span>{completionRate}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <button
            onClick={loadKpis}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh KPI Data
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Total KPIs"
            value={kpis.length}
            sub="Database records"
            icon={Target}
          />
          <MetricCard
            title="Due Soon"
            value={dueSoonKpis}
            sub="Next 7 days"
            icon={Clock}
          />
          <MetricCard
            title="Overdue"
            value={overdueKpis}
            sub="Needs review"
            icon={AlertTriangle}
          />
          <MetricCard
            title="Completed"
            value={completedKpis}
            sub="Finished"
            icon={CheckCircle2}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                KPI Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, update, and manage database-backed KPI records.
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
                placeholder="Search KPIs..."
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
                Loading KPI records
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fetching records from the database.
              </p>
            </div>
          ) : filteredKpis.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <Target size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No KPI records found
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add your first KPI item to start tracking execution.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKpis.map((kpi) => {
                const isSelected = selectedKpi?.id === kpi.id;

                return (
                  <div
                    key={kpi.id}
                    className={`rounded-[1.65rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                      isSelected
                        ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                        : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                    }`}
                  >
                    <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <button
                        onClick={() => setSelectedId(kpi.id)}
                        className="flex flex-1 gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                          <Target size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {kpi.title}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {kpi.owner || "No owner"} · {dueLabel(kpi.dueDate)}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => removeKpi(kpi.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                        aria-label="Remove KPI"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                          kpi.status
                        )}`}
                      >
                        {kpi.status}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityClass(
                          kpi.priority
                        )}`}
                      >
                        {kpi.priority} priority
                      </span>

                      {kpi.dueDate ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {formatDate(kpi.dueDate)}
                        </span>
                      ) : null}
                    </div>

                    {kpi.description ? (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {kpi.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(kpi.id, status)}
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
                KPI Brief
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a KPI and copy its execution brief.
              </p>
            </div>

            <button
              onClick={copyBrief}
              disabled={!selectedKpi}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Brief"}
            </button>
          </div>

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {briefText}
            </pre>
          </div>
        </div>
      </div>
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
