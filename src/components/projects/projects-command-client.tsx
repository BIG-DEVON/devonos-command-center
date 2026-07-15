"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  FileText,
  Flag,
  Plus,
  RefreshCcw,
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
  updatedAt: string;
};

type ProjectForm = {
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
};

type ProjectsApiResponse = {
  ok: boolean;
  projects?: ProjectRecord[];
  project?: ProjectRecord;
  message?: string;
};

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

function normalizeProject(item: Partial<ProjectRecord>): ProjectRecord {
  return {
    id: item.id ?? "",
    name: item.name ?? "",
    owner: item.owner ?? "",
    category: item.category ?? "",
    status: (item.status ?? "Planning") as ProjectStatus,
    priority: (item.priority ?? "High") as ProjectPriority,
    startDate: item.startDate ?? "",
    dueDate: item.dueDate ?? "",
    objective: item.objective ?? "",
    deliverables: item.deliverables ?? "",
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

function statusClass(status: ProjectStatus) {
  if (status === "Completed") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "In Progress" || status === "Review") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Paused" || status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
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

function buildProjectExport(project: ProjectRecord | null) {
  if (!project) return "Select a project to preview its command brief.";

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
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProjects() {
    try {
      setErrorMessage("");

      const response = await fetch("/api/projects", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load projects.");
      }

      const data = (await response.json()) as ProjectsApiResponse;

      if (!data.ok || !data.projects) {
        throw new Error(data.message || "Projects response was invalid.");
      }

      const nextProjects = data.projects.map(normalizeProject);

      setProjects(nextProjects);

      if (!selectedId) {
        setSelectedId(nextProjects[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      setErrorMessage("Projects could not be loaded from the database.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        project.startDate,
        project.dueDate,
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
    if (!selectedId) return filteredProjects[0] ?? null;

    return (
      projects.find((project) => project.id === selectedId) ??
      filteredProjects[0] ??
      null
    );
  }, [filteredProjects, projects, selectedId]);

  const activeProjects = projects.filter((project) =>
    ["Planning", "In Progress", "Review"].includes(project.status)
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const pausedProjects = projects.filter(
    (project) => project.status === "Paused"
  ).length;

  const criticalProjects = projects.filter(
    (project) => project.priority === "Critical"
  ).length;

  const dueSoonProjects = projects.filter((project) => {
    const days = getDaysUntil(project.dueDate);
    return days >= 0 && days <= 14 && project.status !== "Completed";
  }).length;

  const overdueProjects = projects.filter((project) => {
    const days = getDaysUntil(project.dueDate);
    return days < 0 && project.status !== "Completed";
  }).length;

  const completionRate =
    projects.length === 0
      ? 0
      : Math.round((completedProjects / projects.length) * 100);

  const projectExport = buildProjectExport(selectedProject);

  function updateForm<Key extends keyof ProjectForm>(
    key: Key,
    value: ProjectForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrorMessage("");
  }

  async function addProject() {
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create project.");
      }

      const data = (await response.json()) as ProjectsApiResponse;

      if (!data.ok || !data.project) {
        throw new Error(data.message || "Projects response was invalid.");
      }

      const newProject = normalizeProject(data.project);

      setProjects((current) => [newProject, ...current]);
      setSelectedId(newProject.id);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to create project:", error);
      setErrorMessage("Project could not be saved to the database.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: ProjectStatus) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project.");
      }

      const data = (await response.json()) as ProjectsApiResponse;

      if (!data.ok || !data.project) {
        throw new Error(data.message || "Projects response was invalid.");
      }

      const updatedProject = normalizeProject(data.project);

      setProjects((current) =>
        current.map((project) =>
          project.id === id ? updatedProject : project
        )
      );
    } catch (error) {
      console.error("Failed to update project:", error);
      setErrorMessage("Project status could not be updated.");
    }
  }

  async function removeProject(id: string) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project.");
      }

      setProjects((current) => current.filter((project) => project.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      setErrorMessage("Project could not be deleted.");
    }
  }

  async function copyProject() {
    await navigator.clipboard.writeText(projectExport);
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
                Project Command
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add a project record
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Save major workstreams, owners, objectives, deliverables,
                deadlines, and execution notes directly into your Prisma
                database.
              </p>
            </div>

            <button
              onClick={addProject}
              disabled={saving || !loaded}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? "Saving..." : "Save Project"}
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
                Project Name
              </span>
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
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
                onChange={(event) => updateForm("owner", event.target.value)}
                placeholder="Devon, HOD, Communications..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Category
              </span>
              <input
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                placeholder="Content, Event, Internal, Design..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Start Date
              </span>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  updateForm("startDate", event.target.value)
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
                  updateForm("status", event.target.value as ProjectStatus)
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
                  updateForm("priority", event.target.value as ProjectPriority)
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
                Objective
              </span>
              <textarea
                value={form.objective}
                onChange={(event) =>
                  updateForm("objective", event.target.value)
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
                  updateForm("deliverables", event.target.value)
                }
                placeholder="List the outputs: video, report, design pack, social posts..."
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
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder="Approvals, blockers, creative direction, meeting notes..."
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
                {completionRate}% completion signal
              </h2>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/36">
              <span>Portfolio Progress</span>
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
            onClick={loadProjects}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh Project Data
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Projects"
            value={projects.length}
            sub="Database records"
            icon={Briefcase}
          />
          <MetricCard
            title="Active"
            value={activeProjects}
            sub="In motion"
            icon={Sparkles}
          />
          <MetricCard
            title="Due Soon"
            value={dueSoonProjects}
            sub="Next 14 days"
            icon={Clock}
          />
          <MetricCard
            title="Critical"
            value={criticalProjects}
            sub="Priority watch"
            icon={Flag}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Project Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, preview, update, and delete database-backed project
                records.
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

          {!loaded ? (
            <EmptyState
              icon={RefreshCcw}
              title="Loading projects"
              text="Fetching records from the database."
            />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No project records found"
              text="Add your first project to begin building your command portfolio."
            />
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
                          <Briefcase size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {project.name}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {project.owner || "No owner"} ·{" "}
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

                      {project.category ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {project.category}
                        </span>
                      ) : null}

                      {project.dueDate ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          <CalendarDays size={12} className="mr-1 inline" />
                          {formatDate(project.dueDate)}
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
                Select a project and copy its command brief.
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
              {projectExport}
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