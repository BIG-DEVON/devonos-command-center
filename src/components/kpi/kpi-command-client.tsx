"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Check,
  ClipboardList,
  Crown,
  Gauge,
  Plus,
  Search,
  ShieldAlert,
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
  department: string;
  priority: KpiPriority;
  status: KpiStatus;
  dueDate: string;
  progress: number;
  notes: string;
  createdAt: string;
};

type KpiForm = Omit<KpiItem, "id" | "createdAt">;

const STORAGE_KEY = "devonos.kpis.v1";

const emptyForm: KpiForm = {
  title: "",
  owner: "",
  department: "",
  priority: "High",
  status: "In Progress",
  dueDate: "",
  progress: 25,
  notes: "",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isOverdue(item: KpiItem) {
  if (!item.dueDate || item.status === "Completed") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(item.dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

function priorityClass(priority: KpiPriority) {
  if (priority === "Critical") {
    return "bg-red-50 text-red-600 border-red-100";
  }

  if (priority === "High") {
    return "bg-[#FFF8E1] text-[#8A6B22] border-[#D8B76A]/25";
  }

  if (priority === "Medium") {
    return "bg-[#EEF2FF] text-[#5B5DF5] border-[#5B5DF5]/15";
  }

  return "bg-slate-100 text-slate-500 border-slate-200";
}

function statusClass(status: KpiStatus) {
  if (status === "Completed") {
    return "bg-blue-50 text-blue-600 border-blue-100";
  }

  if (status === "In Progress") {
    return "bg-[#EEF2FF] text-[#5B5DF5] border-[#5B5DF5]/15";
  }

  if (status === "Delayed") {
    return "bg-orange-50 text-orange-600 border-orange-100";
  }

  if (status === "Blocked") {
    return "bg-red-50 text-red-600 border-red-100";
  }

  return "bg-slate-100 text-slate-500 border-slate-200";
}

export function KpiCommandClient() {
  const [items, setItems] = useState<KpiItem[]>([]);
  const [form, setForm] = useState<KpiForm>(emptyForm);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return items;

    return items.filter((item) =>
      [
        item.title,
        item.owner,
        item.department,
        item.priority,
        item.status,
        item.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [items, query]);

  const total = items.length;
  const completed = items.filter((item) => item.status === "Completed").length;
  const delayed = items.filter(
    (item) => item.status === "Delayed" || isOverdue(item)
  ).length;
  const critical = items.filter((item) => item.priority === "Critical").length;
  const averageProgress =
    total === 0
      ? 0
      : Math.round(
          items.reduce((sum, item) => sum + Number(item.progress || 0), 0) /
            total
        );

  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  function addKpi() {
    if (!form.title.trim()) return;

    const next: KpiItem = {
      ...form,
      id: makeId(),
      title: form.title.trim(),
      owner: form.owner.trim(),
      department: form.department.trim(),
      notes: form.notes.trim(),
      progress: Math.min(100, Math.max(0, Number(form.progress || 0))),
      createdAt: new Date().toISOString(),
    };

    setItems((current) => [next, ...current]);
    setForm(emptyForm);
  }

  function removeKpi(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function updateStatus(id: string, status: KpiStatus) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              progress: status === "Completed" ? 100 : item.progress,
            }
          : item
      )
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Target size={14} className="text-[#5B5DF5]" />
                KPI Creator
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add departmental KPI
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track priorities, completion status, owners, risks, progress,
                and deadlines.
              </p>
            </div>

            <button
              onClick={addKpi}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              <Plus size={16} />
              Save KPI
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                KPI Title
              </span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Publish weekly tax reform updates"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Owner
              </span>
              <input
                value={form.owner}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    owner: event.target.value,
                  }))
                }
                placeholder="Responsible person"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Department
              </span>
              <input
                value={form.department}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    department: event.target.value,
                  }))
                }
                placeholder="Communication, Media..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Priority
              </span>
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority: event.target.value as KpiPriority,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
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
                    status: event.target.value as KpiStatus,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Delayed</option>
                <option>Blocked</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Due Date
              </span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    dueDate: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Progress %
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    progress: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
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
                placeholder="Add risks, blockers, evidence, or next action..."
                rows={4}
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
                Executive Snapshot
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Department performance radar
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-3xl font-semibold">{completionRate}%</p>
              <p className="mt-1 text-xs text-white/38">Completion rate</p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-3xl font-semibold">{averageProgress}%</p>
              <p className="mt-1 text-xs text-white/38">Average progress</p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-3xl font-semibold">{critical}</p>
              <p className="mt-1 text-xs text-white/38">Critical KPIs</p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-3xl font-semibold">{delayed}</p>
              <p className="mt-1 text-xs text-white/38">Delayed / overdue</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              AI-style recommendation
            </p>
            <p className="mt-3 text-sm leading-6 text-white/62">
              Focus on critical and delayed KPIs first. Push completed KPIs into
              the archive once evidence has been attached in the next version.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Total KPIs"
            value={total}
            icon={ClipboardList}
            sub="Tracked items"
          />
          <MetricCard
            title="Completed"
            value={completed}
            icon={Check}
            sub="Finished"
          />
          <MetricCard
            title="Delayed"
            value={delayed}
            icon={AlertTriangle}
            sub="Needs attention"
          />
          <MetricCard
            title="Critical"
            value={critical}
            icon={ShieldAlert}
            sub="High risk"
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                KPI Board
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage departmental priorities and progress.
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
                placeholder="Search KPI..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <Target size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No KPIs yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add the first KPI and DevonOS will start tracking performance.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.65rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 hover:bg-white"
                >
                  <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-base font-semibold text-[#0B0D12]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-slate-400">
                        {item.owner || "No owner"} ·{" "}
                        {item.department || "No department"}
                      </p>

                      {item.notes ? (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                          {item.notes}
                        </p>
                      ) : null}
                    </div>

                    <button
                      onClick={() => removeKpi(item.id)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                      aria-label="Remove KPI"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityClass(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    {isOverdue(item) ? (
                      <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        Overdue
                      </span>
                    ) : null}

                    {item.dueDate ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                        Due {item.dueDate}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Progress
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {item.progress}%
                      </p>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-950/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#5B5DF5] transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(
                      [
                        "Not Started",
                        "In Progress",
                        "Completed",
                        "Delayed",
                        "Blocked",
                      ] as KpiStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(item.id, status)}
                        className="rounded-full border border-slate-950/[0.08] bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-[#0B0D12]"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
              <BarChart3 size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Completion System
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Visual performance snapshot.
              </p>
            </div>
          </div>

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/66 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Completion rate
              </p>
              <p className="text-sm font-semibold text-[#0B0D12]">
                {completionRate}%
              </p>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-950/[0.06]">
              <div
                className="h-full rounded-full bg-[#0B0D12] transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/72 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#0B0D12]">
            Advanced analytics coming next
            <ArrowUpRight size={16} />
          </button>
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
  icon: React.ElementType;
}) {
  return (
    <div className="devon-glass rounded-[1.7rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
          <Icon size={18} />
        </div>

        <Gauge size={16} className="text-slate-300" />
      </div>

      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>
    </div>
  );
}