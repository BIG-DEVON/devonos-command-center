"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  FileText,
  Folder,
  ImageIcon,
  Link2,
  Package,
  Plus,
  RefreshCcw,
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
  updatedAt: string;
};

type AssetForm = {
  name: string;
  type: AssetType;
  project: string;
  status: AssetStatus;
  priority: AssetPriority;
  link: string;
  tags: string;
  notes: string;
};

type AssetsApiResponse = {
  ok: boolean;
  assets?: AssetRecord[];
  asset?: AssetRecord;
  message?: string;
};

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

function normalizeAsset(item: Partial<AssetRecord>): AssetRecord {
  return {
    id: item.id ?? "",
    name: item.name ?? "",
    type: (item.type ?? "Document") as AssetType,
    project: item.project ?? "",
    status: (item.status ?? "Raw") as AssetStatus,
    priority: (item.priority ?? "Medium") as AssetPriority,
    link: item.link ?? "",
    tags: item.tags ?? "",
    notes: item.notes ?? "",
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function iconForType(type: AssetType) {
  if (type === "Logo") return Sparkles;
  if (type === "Flyer" || type === "Photo") return ImageIcon;
  if (type === "Video" || type === "B-roll") return Video;
  if (type === "Reference") return Link2;
  if (type === "Document") return FileText;
  return Package;
}

function statusClass(status: AssetStatus) {
  if (status === "Ready" || status === "Approved") {
    return "border-[#5B5DF5]/15 bg-[#EEF2FF] text-[#5B5DF5]";
  }

  if (status === "Used") {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (status === "Archived") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  if (status === "In Progress") {
    return "border-[#D8B76A]/25 bg-[#FFF8E1] text-[#8A6B22]";
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

function buildAssetText(asset: AssetRecord | null) {
  if (!asset) return "Select an asset to preview its details.";

  return [
    asset.name,
    "",
    `Type: ${asset.type}`,
    `Project: ${asset.project || "No project assigned"}`,
    `Status: ${asset.status}`,
    `Priority: ${asset.priority}`,
    `Link: ${asset.link || "No link added"}`,
    `Tags: ${asset.tags || "No tags added"}`,
    `Created: ${formatDate(asset.createdAt)}`,
    "",
    "Notes:",
    asset.notes || "No notes added.",
  ].join("\n");
}

export function AssetLibraryClient() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [form, setForm] = useState<AssetForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadAssets() {
    try {
      setErrorMessage("");

      const response = await fetch("/api/assets", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load assets.");
      }

      const data = (await response.json()) as AssetsApiResponse;

      if (!data.ok || !data.assets) {
        throw new Error(data.message || "Assets response was invalid.");
      }

      const nextAssets = data.assets.map(normalizeAsset);

      setAssets(nextAssets);

      if (!selectedId) {
        setSelectedId(nextAssets[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Failed to load assets:", error);
      setErrorMessage("Assets could not be loaded from the database.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!selectedId) return filteredAssets[0] ?? null;

    return (
      assets.find((asset) => asset.id === selectedId) ??
      filteredAssets[0] ??
      null
    );
  }, [assets, filteredAssets, selectedId]);

  const readyAssets = assets.filter(
    (asset) => asset.status === "Ready" || asset.status === "Approved"
  ).length;

  const progressAssets = assets.filter(
    (asset) => asset.status === "In Progress"
  ).length;

  const usedAssets = assets.filter((asset) => asset.status === "Used").length;
  const highPriorityAssets = assets.filter(
    (asset) => asset.priority === "High"
  ).length;

  const projectCount = new Set(
    assets.map((asset) => asset.project.trim()).filter(Boolean)
  ).size;

  const previewText = buildAssetText(selectedAsset);

  function updateForm<Key extends keyof AssetForm>(
    key: Key,
    value: AssetForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrorMessage("");
  }

  async function addAsset() {
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create asset.");
      }

      const data = (await response.json()) as AssetsApiResponse;

      if (!data.ok || !data.asset) {
        throw new Error(data.message || "Assets response was invalid.");
      }

      const newAsset = normalizeAsset(data.asset);

      setAssets((current) => [newAsset, ...current]);
      setSelectedId(newAsset.id);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to create asset:", error);
      setErrorMessage("Asset could not be saved to the database.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: AssetStatus) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/assets/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update asset.");
      }

      const data = (await response.json()) as AssetsApiResponse;

      if (!data.ok || !data.asset) {
        throw new Error(data.message || "Assets response was invalid.");
      }

      const updatedAsset = normalizeAsset(data.asset);

      setAssets((current) =>
        current.map((asset) => (asset.id === id ? updatedAsset : asset))
      );
    } catch (error) {
      console.error("Failed to update asset:", error);
      setErrorMessage("Asset status could not be updated.");
    }
  }

  async function removeAsset(id: string) {
    try {
      setErrorMessage("");

      const response = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete asset.");
      }

      setAssets((current) => current.filter((asset) => asset.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to delete asset:", error);
      setErrorMessage("Asset could not be deleted.");
    }
  }

  async function copyAsset() {
    await navigator.clipboard.writeText(previewText);
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
                <Folder size={14} className="text-[#5B5DF5]" />
                Asset Intake
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Save an asset record
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Store logos, videos, flyers, links, references, B-roll,
                documents, and production notes directly inside your Prisma
                database.
              </p>
            </div>

            <button
              onClick={addAsset}
              disabled={saving || !loaded}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? "Saving..." : "Save Asset"}
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
                Asset Name
              </span>
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="e.g. Official JRB Logo / Documentary Frame 01"
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
                  updateForm("type", event.target.value as AssetType)
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
                onChange={(event) => updateForm("project", event.target.value)}
                placeholder="e.g. Presumptive Tax Documentary"
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
                  updateForm("status", event.target.value as AssetStatus)
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
                  updateForm("priority", event.target.value as AssetPriority)
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
                File / Drive / Reference Link
              </span>
              <input
                value={form.link}
                onChange={(event) => updateForm("link", event.target.value)}
                placeholder="Paste Google Drive, website, file reference, or design link..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tags
              </span>
              <input
                value={form.tags}
                onChange={(event) => updateForm("tags", event.target.value)}
                placeholder="logo, b-roll, final, reference, social, documentary..."
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
                placeholder="Usage notes, approval status, design direction, version notes, or file context..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>
          </div>
        </div>

        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Folder size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                Asset Library
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {assets.length} database assets
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <DarkMetric value={readyAssets} label="Ready" />
            <DarkMetric value={progressAssets} label="Active" />
            <DarkMetric value={usedAssets} label="Used" />
            <DarkMetric value={projectCount} label="Projects" />
          </div>

          <button
            onClick={loadAssets}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Refresh Asset Data
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            title="Assets"
            value={assets.length}
            sub="Database records"
            icon={Folder}
          />
          <MetricCard
            title="Ready"
            value={readyAssets}
            sub="Ready / approved"
            icon={CheckCircle2}
          />
          <MetricCard
            title="High Priority"
            value={highPriorityAssets}
            sub="Needs attention"
            icon={Sparkles}
          />
          <MetricCard
            title="Projects"
            value={projectCount}
            sub="Linked projects"
            icon={Package}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Asset Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, preview, update, and delete database-backed asset
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
                placeholder="Search assets..."
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
                Loading assets
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fetching records from the database.
              </p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
                <Folder size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No asset records found
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add your first asset to begin organizing files and references.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssets.map((asset) => {
                const Icon = iconForType(asset.type);
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
                            {asset.project || "No project"} · {asset.type}
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

                      {asset.tags ? (
                        <span className="rounded-full border border-slate-950/[0.08] bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {asset.tags}
                        </span>
                      ) : null}
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
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Asset Preview
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select an asset and copy its full record.
              </p>
            </div>

            <button
              onClick={copyAsset}
              disabled={!selectedAsset}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Asset"}
            </button>
          </div>

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {previewText}
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