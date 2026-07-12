"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Crown,
  FileText,
  Palette,
  RefreshCcw,
  Save,
  Settings,
  Shield,
  Type,
  User,
} from "lucide-react";

type DevonTone =
  | "Premium"
  | "Official"
  | "Warm"
  | "Bold"
  | "Simple"
  | "Luxury"
  | "Professional";

type DevonMode = "Personal" | "Work" | "Executive" | "Creative";

type DevonSettings = {
  displayName: string;
  roleTitle: string;
  organization: string;
  defaultTone: DevonTone;
  defaultMode: DevonMode;
  signature: string;
  brandDirection: string;
  designRules: string;
  writingRules: string;
  postingRules: string;
  systemNotes: string;
  updatedAt: string;
};

type SettingsApiResponse = {
  ok: boolean;
  settings?: DevonSettings;
  message?: string;
};

const tones: DevonTone[] = [
  "Premium",
  "Official",
  "Warm",
  "Bold",
  "Simple",
  "Luxury",
  "Professional",
];

const modes: DevonMode[] = ["Personal", "Work", "Executive", "Creative"];

const defaultSettings: DevonSettings = {
  displayName: "Big Devon",
  roleTitle: "Communications Intelligence Lead",
  organization: "DevonOS",
  defaultTone: "Premium",
  defaultMode: "Work",
  signature: "Big Devon",
  brandDirection:
    "Premium white interface, soft platinum depth, deep ink text, blue-violet accents, champagne highlights, elegant spacing, and no green.",
  designRules:
    "Use clean negative space, refined typography, subtle glass effects, cinematic cards, soft shadows, and premium editorial layouts. Avoid clutter, fake logos, random data, and cheap AI-looking designs.",
  writingRules:
    "Write with clarity, confidence, polish, and structure. Keep official messages respectful, concise, and easy to understand.",
  postingRules:
    "Review captions before posting. Confirm sensitive details. Keep public communication accurate, calm, and professional.",
  systemNotes:
    "DevonOS is now connected to a local SQLite database through Prisma. Backend routes, saved modules, authentication, file uploads, and team access will be added progressively.",
  updatedAt: new Date().toISOString(),
};

function normalizeSettings(settings?: Partial<DevonSettings>): DevonSettings {
  return {
    ...defaultSettings,
    ...settings,
    updatedAt: settings?.updatedAt ?? new Date().toISOString(),
  };
}

function formatDate(dateString: string) {
  if (!dateString) return "Not saved yet";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildSettingsExport(settings: DevonSettings) {
  return [
    "DEVONOS SETTINGS PROFILE",
    "",
    `Display Name: ${settings.displayName}`,
    `Role Title: ${settings.roleTitle}`,
    `Organization: ${settings.organization}`,
    `Default Tone: ${settings.defaultTone}`,
    `Default Mode: ${settings.defaultMode}`,
    `Signature: ${settings.signature}`,
    "",
    "Brand Direction:",
    settings.brandDirection,
    "",
    "Design Rules:",
    settings.designRules,
    "",
    "Writing Rules:",
    settings.writingRules,
    "",
    "Posting Rules:",
    settings.postingRules,
    "",
    "System Notes:",
    settings.systemNotes,
    "",
    `Last Updated: ${formatDate(settings.updatedAt)}`,
  ].join("\n");
}

export function SettingsCommandClient() {
  const [settings, setSettings] = useState<DevonSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setErrorMessage("");

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load settings.");
        }

        const data = (await response.json()) as SettingsApiResponse;

        if (!data.ok || !data.settings) {
          throw new Error(data.message || "Settings response was invalid.");
        }

        setSettings(normalizeSettings(data.settings));
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettings(defaultSettings);
        setErrorMessage(
          "Settings could not be loaded from the database. Default settings are showing for now."
        );
      } finally {
        setLoaded(true);
      }
    }

    loadSettings();
  }, []);

  const exportText = useMemo(() => buildSettingsExport(settings), [settings]);

  function updateField<Key extends keyof DevonSettings>(
    key: Key,
    value: DevonSettings[Key]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setErrorMessage("");
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setErrorMessage("");

      const nextSettings: DevonSettings = {
        ...settings,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings.");
      }

      const data = (await response.json()) as SettingsApiResponse;

      if (!data.ok || !data.settings) {
        throw new Error(data.message || "Settings response was invalid.");
      }

      setSettings(normalizeSettings(data.settings));
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setErrorMessage("Settings could not be saved. Check the API route and database connection.");
    } finally {
      setSaving(false);
    }
  }

  async function resetSettings() {
    try {
      setSaving(true);
      setErrorMessage("");

      const nextSettings: DevonSettings = {
        ...defaultSettings,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to reset settings.");
      }

      const data = (await response.json()) as SettingsApiResponse;

      if (!data.ok || !data.settings) {
        throw new Error(data.message || "Settings response was invalid.");
      }

      setSettings(normalizeSettings(data.settings));
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to reset settings:", error);
      setErrorMessage("Settings could not be reset. Check the API route and database connection.");
    } finally {
      setSaving(false);
    }
  }

  async function copySettings() {
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
                <Settings size={14} className="text-[#5B5DF5]" />
                Identity Settings
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Define your DevonOS profile
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Save your identity, preferred tone, signature, brand direction,
                and operating rules directly into your Prisma database.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={resetSettings}
                disabled={saving || !loaded}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw size={16} />
                Reset
              </button>

              <button
                onClick={saveSettings}
                disabled={saving || !loaded}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                {saved ? "Saved" : saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
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
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Display Name
              </span>
              <input
                value={settings.displayName}
                onChange={(event) =>
                  updateField("displayName", event.target.value)
                }
                placeholder="Big Devon"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Role Title
              </span>
              <input
                value={settings.roleTitle}
                onChange={(event) =>
                  updateField("roleTitle", event.target.value)
                }
                placeholder="Communications Intelligence Lead"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Organization / Workspace
              </span>
              <input
                value={settings.organization}
                onChange={(event) =>
                  updateField("organization", event.target.value)
                }
                placeholder="DevonOS"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Signature
              </span>
              <input
                value={settings.signature}
                onChange={(event) => updateField("signature", event.target.value)}
                placeholder="Big Devon"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Default Tone
              </span>
              <select
                value={settings.defaultTone}
                onChange={(event) =>
                  updateField("defaultTone", event.target.value as DevonTone)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {tones.map((tone) => (
                  <option key={tone}>{tone}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Default Mode
              </span>
              <select
                value={settings.defaultMode}
                onChange={(event) =>
                  updateField("defaultMode", event.target.value as DevonMode)
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {modes.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Brand Direction
              </span>
              <textarea
                value={settings.brandDirection}
                onChange={(event) =>
                  updateField("brandDirection", event.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Design Rules
              </span>
              <textarea
                value={settings.designRules}
                onChange={(event) =>
                  updateField("designRules", event.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Writing Rules
              </span>
              <textarea
                value={settings.writingRules}
                onChange={(event) =>
                  updateField("writingRules", event.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Posting Rules
              </span>
              <textarea
                value={settings.postingRules}
                onChange={(event) =>
                  updateField("postingRules", event.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                System Notes
              </span>
              <textarea
                value={settings.systemNotes}
                onChange={(event) =>
                  updateField("systemNotes", event.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Crown size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                System Identity
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {settings.displayName || "DevonOS"}
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            <InfoRow label="Role" value={settings.roleTitle} />
            <InfoRow label="Mode" value={settings.defaultMode} />
            <InfoRow label="Tone" value={settings.defaultTone} />
            <InfoRow label="Updated" value={formatDate(settings.updatedAt)} />
          </div>

          <button
            onClick={copySettings}
            disabled={!loaded}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] shadow-[0_18px_55px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy Settings Profile"}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SettingCard
            title="Identity"
            value={settings.displayName}
            note={settings.roleTitle}
            icon={User}
          />
          <SettingCard
            title="Tone"
            value={settings.defaultTone}
            note={settings.defaultMode}
            icon={Type}
          />
          <SettingCard
            title="Brand"
            value="Premium"
            note="White / Ink / Violet / Champagne"
            icon={Palette}
          />
          <SettingCard
            title="Storage"
            value="Database"
            note="Prisma SQLite mode"
            icon={Shield}
          />
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#8A6B22]">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Settings Preview
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Copy or review your saved database profile.
              </p>
            </div>
          </div>

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[680px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {loaded ? exportText : "Loading settings from database..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.055] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/34">
        {label}
      </p>
      <p className="text-right text-sm font-medium text-white/72">
        {value || "Not set"}
      </p>
    </div>
  );
}

function SettingCard({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: ElementType;
}) {
  return (
    <div className="devon-glass rounded-[1.7rem] p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
        <Icon size={18} />
      </div>

      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#0B0D12]">
        {value || "Not set"}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">{note}</p>
    </div>
  );
}