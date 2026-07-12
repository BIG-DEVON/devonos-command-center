"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  FileText,
  Layers,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Users,
} from "lucide-react";

type ProjectStatus =
  | "Idea"
  | "Planning"
  | "In Progress"
  | "Review"
  | "Completed"
  | "Paused"
  | "Archived";

type ProjectPriority = "Critical" | "High" | "Medium" | "Low";

type ProjectRecord = {
  id: string;
  name: string;
  owner: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
  objective: string;
  deliverables: string;
  notes: string;
  createdAt: string;
};

type ProjectForm = Omit<ProjectRecord, "id" | "createdAt">;

const STORAGE_KEY = "devonos.projects.v1";

const statuses: ProjectStatus[] = [
  "Idea",
  "Planning",
  "In Progress",
  "Review",
  "Completed",
  "Paused",
  "Archived",
];

const priorities: ProjectPriority[] = ["Critical", "High", "Medium", "Low"];

const emptyForm: ProjectForm = {
  name: "",
  owner: "",
  category: "",
  status: "Planning",
  priority: "High",
  startDate: "",
  dueDate: "",
  objective: "",
  deliverables: "",
  notes: "",
};

const starterProjects: ProjectRecord[] = [
  {
    id: "starter-presumptive-tax-doc",
    name: "Presumptive Tax Documentary",
    owner: "Devon",
    category: "Video / Documentary",
    status: "In Progress",
    priority: "Critical",
    startDate: "",
    dueDate: "",
    objective:
      "Create a premium 4K government documentary explaining the Presumptive Tax Regulations 2026.",
    deliverables:
      "Voiceover, documentary frames, b-roll, captions, final edit, export, and social cutdowns.",
    notes:
      "Keep the visual direction official, cinematic, clean, and premium. Avoid clutter and inaccurate logos.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-social-command",
    name: "Social Media Command Workflow",
    owner: "Devon",
    category: "Communications",
    status: "Planning",
    priority: "High",
    startDate: "",
    dueDate: "",
    objective:
      "Build a clean workflow for drafting, reviewing, scheduling, and tracking public posts.",
    deliverables:
      "Social Studio records, caption bank, content calendar, approval notes, and publishing reports.",
    notes: "Connect to Social Studio and Reports after backend setup.",
    createdAt: new Date().toISOString(),
  },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function dueLabel(dateString: string) {
  const days = getDaysUntil(dateString);

  if (days === 999999) return "No due date";
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function priorityClass(priority: ProjectPriority) {
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

function statusClass(status: ProjectStatus) {
  if (status === "Completed") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "In Progress" || status === "Review") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Planning") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (status === "Paused" || status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-slate-200 bg-white text-slate-500";
}

function buildProjectExport(project: ProjectRecord | null) {
  if (!project) return "Select a project to preview its details.";

  return [
    project.name,
    "",
    `Owner: ${project.owner || "No owner assigned"}`,
    `Category: ${project.category || "No category"}`,
    `Status: ${project.status}`,
    `Priority: ${project.priority}`,
    `Start Date: ${formatDate(project.startDate)}`,
    `Due Date: ${formatDate(project.dueDate)} (${dueLabel(project.dueDate)})`,
    "",
    "Objective:",
    project.objective || "No objective added.",
    "",
    "Deliverables:",
    project.deliverables || "No deliverables added.",
    "",
    "Notes:",
    project.notes || "No notes added.",
  ].join("\n");
}

export function ProjectsCommandClient() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setProjects(stored ? JSON.parse(stored) : starterProjects);
    } catch {
      setProjects(starterProjects);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return projects;

    return projects.filter((project) =>
      [
        project.name,
        project.owner,
        project.category,
        project.status,
        project.priority,
        project.objective,
        project.deliverables,
        project.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [projects, query]);

  const selectedProject = useMemo(() => {
    if (!selectedId) return projects[0] ?? null;
    return projects.find((project) => project.id === selectedId) ?? null;
  }, [projects, selectedId]);

  const activeProjects = projects.filter(
    (project) =>
      project.status === "Planning" ||
      project.status === "In Progress" ||
      project.status === "Review"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const criticalProjects = projects.filter(
    (project) => project.priority === "Critical"
  ).length;

  const overdueProjects = projects.filter((project) => {
    const days = getDaysUntil(project.dueDate);
    return days < 0 && project.status !== "Completed";
  }).length;

  const dueSoonProjects = projects.filter((project) => {
    const days = getDaysUntil(project.dueDate);
    return days >= 0 && days <= 7 && project.status !== "Completed";
  }).length;

  const exportText = buildProjectExport(selectedProject);

  function addProject() {
    if (!form.name.trim()) return;

    const newProject: ProjectRecord = {
      ...form,
      id: makeId(),
      name: form.name.trim(),
      owner: form.owner.trim(),
      category: form.category.trim(),
      objective: form.objective.trim(),
      deliverables: form.deliverables.trim(),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setProjects((current) => [newProject, ...current]);
    setSelectedId(newProject.id);
    setForm(emptyForm);
  }

  function removeProject(id: string) {
    setProjects((current) => current.filter((project) => project.id !== id));

    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function updateStatus(id: string, status: ProjectStatus) {
    setProjects((current) =>
      current.map((project) =>
        project.id === id ? { ...project, status } : project
      )
    );
  }

  async function copyProject() {
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
                <Briefcase size={14} className="text-[#5B5DF5]" />
                Project Intake
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add a project
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create structured project records for campaigns, videos,
                content pipelines, internal work, and high-priority execution.
              </p>
            </div>

            <button
              onClick={addProject}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              <Plus size={16} />
              Save Project
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Project Name
              </span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Presumptive Tax Documentary"
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
                placeholder="Devon, Communications Team..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Category
              </span>
              <input
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                placeholder="Video, Website, Social, Design..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
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
                    status: event.target.value as ProjectStatus,
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
                Priority
              </span>
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority: event.target.value as ProjectPriority,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Start Date
              </span>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
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

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Objective
              </span>
              <textarea
                value={form.objective}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    objective: event.target.value,
                  }))
                }
                placeholder="What is the main goal of this project?"
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Deliverables
              </span>
              <textarea
                value={form.deliverables}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deliverables: event.target.value,
                  }))
                }
                placeholder="List the files, posts, videos, reports, or outputs needed."
                rows={4}
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
                placeholder="Add blockers, approvals, design notes, or next actions."
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
                Project Control
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {activeProjects} active workstreams
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <DarkMetric value={projects.length} label="Projects" />
            <DarkMetric value={activeProjects} label="Active" />
            <DarkMetric value={criticalProjects} label="Critical" />
            <DarkMetric value={completedProjects} label="Done" />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              Execution note
            </p>
            <p className="mt-3 text-sm leading-6 text-white/62">
              Use Projects Command for big workstreams, then connect tasks,
              assets, captions, reports, and deadlines around each project.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Projects"
            value={projects.length}
            sub="Saved records"
            icon={Briefcase}
          />
          <MetricCard
            title="Due Soon"
            value={dueSoonProjects}
            sub="Next 7 days"
            icon={Clock}
          />
          <MetricCard
            title="Overdue"
            value={overdueProjects}
            sub="Needs action"
            icon={AlertTriangle}
          />
          <MetricCard
            title="Completed"
            value={completedProjects}
            sub="Finished"
            icon={CheckCircle2}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Project Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search and manage all major DevonOS workstreams.
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
                placeholder="Search projects..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <Briefcase size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No projects yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add a project to begin tracking your workstreams.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const isSelected = selectedProject?.id === project.id;

                return (
                  <div
                    key={project.id}
                    className={`rounded-[1.65rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                      isSelected
                        ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                        : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                    }`}
                  >
                    <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <button
                        onClick={() => setSelectedId(project.id)}
                        className="flex flex-1 gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                          <Layers size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {project.name}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {project.category || "No category"} ·{" "}
                            {dueLabel(project.dueDate)}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => removeProject(project.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                        aria-label="Remove project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityClass(
                          project.priority
                        )}`}
                      >
                        {project.priority} priority
                      </span>

                      {project.owner ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {project.owner}
                        </span>
                      ) : null}
                    </div>

                    {project.objective ? (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {project.objective}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(project.id, status)}
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
                Project Brief
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a project and copy its brief.
              </p>
            </div>

            <button
              onClick={copyProject}
              disabled={!selectedProject}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Brief"}
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