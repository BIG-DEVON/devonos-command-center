"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Crown,
  FileText,
  Folder,
  ImageIcon,
  Link,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";

type AssetType =
  | "Logo"
  | "Flyer"
  | "Video"
  | "Photo"
  | "Document"
  | "B-roll"
  | "Reference"
  | "Other";

type AssetStatus =
  | "Raw"
  | "In Progress"
  | "Ready"
  | "Approved"
  | "Used"
  | "Archived";

type AssetPriority = "High" | "Medium" | "Low";

type AssetRecord = {
  id: string;
  name: string;
  type: AssetType;
  project: string;
  status: AssetStatus;
  priority: AssetPriority;
  link: string;
  tags: string;
  notes: string;
  createdAt: string;
};

type AssetForm = Omit<AssetRecord, "id" | "createdAt">;

const STORAGE_KEY = "devonos.assets.v1";

const assetTypes: AssetType[] = [
  "Logo",
  "Flyer",
  "Video",
  "Photo",
  "Document",
  "B-roll",
  "Reference",
  "Other",
];

const statuses: AssetStatus[] = [
  "Raw",
  "In Progress",
  "Ready",
  "Approved",
  "Used",
  "Archived",
];

const priorities: AssetPriority[] = ["High", "Medium", "Low"];

const emptyForm: AssetForm = {
  name: "",
  type: "Document",
  project: "",
  status: "Raw",
  priority: "Medium",
  link: "",
  tags: "",
  notes: "",
};

const starterAssets: AssetRecord[] = [
  {
    id: "starter-jrb-logo",
    name: "Official JRB Logo",
    type: "Logo",
    project: "JRB Brand Assets",
    status: "Approved",
    priority: "High",
    link: "",
    tags: "JRB, logo, official, brand",
    notes:
      "Use only the accurate official logo. Do not recreate or fake this asset.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-presumptive-tax-frame",
    name: "Presumptive Tax Documentary Frames",
    type: "Photo",
    project: "Presumptive Tax Regulations 2026",
    status: "In Progress",
    priority: "High",
    link: "",
    tags: "documentary, tax, JRB, frames",
    notes:
      "Premium 4K government documentary visuals. White, dark ink, champagne, and blue-violet DevonOS direction.",
    createdAt: new Date().toISOString(),
  },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function assetIcon(type: AssetType) {
  if (type === "Logo") return Sparkles;
  if (type === "Flyer") return ImageIcon;
  if (type === "Video") return Video;
  if (type === "Photo") return ImageIcon;
  if (type === "Document") return FileText;
  if (type === "B-roll") return Video;
  if (type === "Reference") return Link;
  return Package;
}

function typeClass(type: AssetType) {
  if (type === "Logo") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (type === "Video" || type === "B-roll") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (type === "Flyer" || type === "Photo") {
    return "border-pink-100 bg-pink-50 text-pink-600";
  }

  if (type === "Reference") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function statusClass(status: AssetStatus) {
  if (status === "Approved" || status === "Ready") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "In Progress") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  if (status === "Used") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-slate-200 bg-white text-slate-500";
}

function priorityClass(priority: AssetPriority) {
  if (priority === "High") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (priority === "Medium") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function buildAssetExport(asset: AssetRecord | null) {
  if (!asset) return "Select an asset to preview its details.";

  const lines: string[] = [];

  lines.push(asset.name);
  lines.push("");
  lines.push(`Type: ${asset.type}`);
  lines.push(`Project: ${asset.project || "No project assigned"}`);
  lines.push(`Status: ${asset.status}`);
  lines.push(`Priority: ${asset.priority}`);

  if (asset.link) {
    lines.push("");
    lines.push(`Link: ${asset.link}`);
  }

  if (asset.tags) {
    lines.push("");
    lines.push(`Tags: ${asset.tags}`);
  }

  if (asset.notes) {
    lines.push("");
    lines.push("Notes:");
    lines.push(asset.notes);
  }

  return lines.join("\n");
}

export function AssetLibraryClient() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [form, setForm] = useState<AssetForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setAssets(JSON.parse(stored));
      } else {
        setAssets(starterAssets);
      }
    } catch {
      setAssets(starterAssets);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return assets;

    return assets.filter((asset) =>
      [
        asset.name,
        asset.type,
        asset.project,
        asset.status,
        asset.priority,
        asset.link,
        asset.tags,
        asset.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [assets, query]);

  const selectedAsset = useMemo(() => {
    if (!selectedId) return assets[0] ?? null;
    return assets.find((asset) => asset.id === selectedId) ?? null;
  }, [assets, selectedId]);

  const readyAssets = assets.filter(
    (asset) => asset.status === "Ready" || asset.status === "Approved"
  ).length;

  const inProgressAssets = assets.filter(
    (asset) => asset.status === "In Progress"
  ).length;

  const highPriorityAssets = assets.filter(
    (asset) => asset.priority === "High"
  ).length;

  const projects = new Set(
    assets
      .map((asset) => asset.project.trim())
      .filter((project) => project.length > 0)
  ).size;

  const exportText = buildAssetExport(selectedAsset);

  function addAsset() {
    if (!form.name.trim()) return;

    const newAsset: AssetRecord = {
      ...form,
      id: makeId(),
      name: form.name.trim(),
      project: form.project.trim(),
      link: form.link.trim(),
      tags: form.tags.trim(),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setAssets((current) => [newAsset, ...current]);
    setSelectedId(newAsset.id);
    setForm(emptyForm);
  }

  function removeAsset(id: string) {
    setAssets((current) => current.filter((asset) => asset.id !== id));

    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function updateStatus(id: string, status: AssetStatus) {
    setAssets((current) =>
      current.map((asset) => (asset.id === id ? { ...asset, status } : asset))
    );
  }

  async function copyAsset() {
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
                <Folder size={14} className="text-[#5B5DF5]" />
                Asset Intake
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add asset record
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Save your logos, visual references, videos, documents, and
                creative files into one organized command library.
              </p>
            </div>

            <button
              onClick={addAsset}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              <Plus size={16} />
              Save Asset
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Asset Name
              </span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Official JRB Logo, Documentary Frame 06"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Asset Type
              </span>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as AssetType,
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {assetTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Project
              </span>
              <input
                value={form.project}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    project: event.target.value,
                  }))
                }
                placeholder="JRB, DevonOS, Presumptive Tax..."
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
                    status: event.target.value as AssetStatus,
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
                    priority: event.target.value as AssetPriority,
                  }))
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
                Link / File Location
              </span>
              <input
                value={form.link}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    link: event.target.value,
                  }))
                }
                placeholder="Paste Google Drive link, local folder note, or reference URL"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tags
              </span>
              <input
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                placeholder="logo, official, documentary, tax, video, poster"
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
                placeholder="Usage rules, design notes, where the file came from, approval reminders..."
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
                Library Health
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Creative assets organized.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <DarkMetric value={assets.length} label="Assets" />
            <DarkMetric value={projects} label="Projects" />
            <DarkMetric value={readyAssets} label="Ready" />
            <DarkMetric value={highPriorityAssets} label="Priority" />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              Storage note
            </p>
            <p className="mt-3 text-sm leading-6 text-white/62">
              This version stores asset records only. Actual file uploads,
              previews, folders, and cloud storage come after the database and
              storage layer.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Total Assets"
            value={assets.length}
            sub="Saved records"
            icon={Package}
          />
          <MetricCard
            title="Ready"
            value={readyAssets}
            sub="Ready / approved"
            icon={CheckCircle2}
          />
          <MetricCard
            title="In Progress"
            value={inProgressAssets}
            sub="Being worked on"
            icon={Sparkles}
          />
          <MetricCard
            title="Projects"
            value={projects}
            sub="Asset groups"
            icon={Folder}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Asset Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, select, and manage creative assets.
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
                placeholder="Search assets..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <Package size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No assets yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add your first logo, video, document, reference, or design file.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssets.map((asset) => {
                const Icon = assetIcon(asset.type);
                const isSelected = selectedAsset?.id === asset.id;

                return (
                  <div
                    key={asset.id}
                    className={`rounded-[1.65rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                      isSelected
                        ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                        : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                    }`}
                  >
                    <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <button
                        onClick={() => setSelectedId(asset.id)}
                        className="flex flex-1 gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-700">
                          <Icon size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0B0D12]">
                            {asset.name}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {asset.project || "No project"} · Added{" "}
                            {formatDate(asset.createdAt)}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                        aria-label="Remove asset"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${typeClass(
                          asset.type
                        )}`}
                      >
                        {asset.type}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                          asset.status
                        )}`}
                      >
                        {asset.status}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityClass(
                          asset.priority
                        )}`}
                      >
                        {asset.priority} priority
                      </span>
                    </div>

                    {asset.notes ? (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {asset.notes}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(asset.id, status)}
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
              <FileText size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Asset Details
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select an asset and copy its record.
              </p>
            </div>
          </div>

          {selectedAsset ? (
            <div className="mb-4 rounded-[1.55rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Selected asset
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#0B0D12]">
                {selectedAsset.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedAsset.type} · {selectedAsset.status}
              </p>
            </div>
          ) : null}

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {exportText}
            </pre>
          </div>

          <button
            onClick={copyAsset}
            disabled={!selectedAsset}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy Asset Record"}
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
