"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cloud,
  Crown,
  DatabaseBackup,
  Download,
  Gauge,
  Laptop,
  LockKeyhole,
  MonitorSmartphone,
  Moon,
  Palette,
  RefreshCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Type,
  User,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useDevonPreferences } from "@/components/providers/devon-preferences-provider";
import { NotificationDeliveryCenter } from "@/components/settings/notification-delivery-center";
import {
  defaultSettings,
  devonModes,
  devonTimezones,
  devonTones,
  normalizeSettings,
  type DevonDensity,
  type DevonMode,
  type DevonMotion,
  type DevonSettings,
  type DevonTheme,
  type DevonTone,
  type WeekStartsOn,
} from "@/lib/devon-settings";

type SectionId = "appearance" | "alerts" | "schedule" | "profile" | "data";

type SettingsApiResponse = {
  ok: boolean;
  settings?: DevonSettings;
  message?: string;
};

const sections: {
  id: SectionId;
  label: string;
  description: string;
  icon: ElementType;
}[] = [
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme, motion, and density",
    icon: Palette,
  },
  {
    id: "alerts",
    label: "Sounds & alerts",
    description: "How Morrow gets your attention",
    icon: Bell,
  },
  {
    id: "schedule",
    label: "Schedule",
    description: "Timezone, week, and quiet hours",
    icon: CalendarDays,
  },
  {
    id: "profile",
    label: "Profile & voice",
    description: "Identity and communication rules",
    icon: User,
  },
  {
    id: "data",
    label: "Data & access",
    description: "Backup, safety, and future accounts",
    icon: ShieldCheck,
  },
];

const instantPreferenceKeys: (keyof DevonSettings)[] = [
  "theme",
  "density",
  "motion",
  "interfaceSounds",
  "soundVolume",
  "inAppNotifications",
  "browserNotifications",
  "weekStartsOn",
];

function formatDate(dateString: string) {
  if (!dateString || Number.isNaN(Date.parse(dateString))) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function SettingsCommandClient({
  canManageAccess,
  canManageWorkspace,
}: {
  canManageAccess: boolean;
  canManageWorkspace: boolean;
}) {
  const { applySettings, playSound } = useDevonPreferences();
  const [settings, setSettings] = useState<DevonSettings>(defaultSettings);
  const [activeSection, setActiveSection] =
    useState<SectionId>("appearance");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [databaseOnline, setDatabaseOnline] = useState<boolean | null>(null);
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    async function loadSettings() {
      try {
        setErrorMessage("");

        const [settingsResponse, healthResponse] = await Promise.all([
          fetch("/api/settings", { method: "GET", cache: "no-store" }),
          fetch("/api/health/db", { method: "GET", cache: "no-store" }),
        ]);

        if (!settingsResponse.ok) {
          throw new Error("Failed to load settings.");
        }

        const data = (await settingsResponse.json()) as SettingsApiResponse;

        if (!data.ok || !data.settings) {
          throw new Error(data.message || "Settings response was invalid.");
        }

        const normalized = normalizeSettings(data.settings);
        setSettings(normalized);
        applySettings(normalized);

        if (healthResponse.ok) {
          const health = (await healthResponse.json()) as {
            ok: boolean;
            counts?: Record<string, number>;
          };
          setDatabaseOnline(health.ok);
          setRecordCount(
            Object.values(health.counts ?? {}).reduce(
              (total, count) => total + count,
              0
            )
          );
        } else {
          setDatabaseOnline(false);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        setErrorMessage(
          "Morrow could not load your saved preferences. No changes have been made."
        );
        setDatabaseOnline(false);
      } finally {
        setLoaded(true);
      }
    }

    void loadSettings();

  }, [applySettings]);

  const activeSectionMeta = useMemo(
    () => sections.find((section) => section.id === activeSection) ?? sections[0],
    [activeSection]
  );

  function updateField<Key extends keyof DevonSettings>(
    key: Key,
    value: DevonSettings[Key]
  ) {
    if (!canManageWorkspace) {
      setErrorMessage("Only the Owner or an Admin can change workspace settings.");
      return;
    }
    setSettings((current) => {
      const next = { ...current, [key]: value };

      if (instantPreferenceKeys.includes(key)) {
        applySettings(next);
      }

      return next;
    });
    setDirty(true);
    setSaved(false);
    setErrorMessage("");
  }

  async function saveSettings() {
    if (!canManageWorkspace) return false;
    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = (await response.json()) as SettingsApiResponse;

      if (!response.ok || !data.ok || !data.settings) {
        throw new Error(data.message || "Failed to save settings.");
      }

      const normalized = normalizeSettings(data.settings);
      setSettings(normalized);
      applySettings(normalized);
      setDirty(false);
      setSaved(true);

      if (normalized.interfaceSounds) playSound();
      window.setTimeout(() => setSaved(false), 2200);
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      setErrorMessage(
        "Your settings were not saved. Morrow kept your previous database values."
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function resetSettings() {
    if (!canManageWorkspace) return;
    if (
      settings.confirmDestructiveTasks &&
      !window.confirm(
        "Reset every Morrow preference and profile rule to its default value?"
      )
    ) {
      return;
    }

    const resetValue = normalizeSettings({
      ...defaultSettings,
      updatedAt: new Date().toISOString(),
    });
    setSettings(resetValue);
    applySettings(resetValue);
    setDirty(true);
    setSaved(false);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="devon-glass h-fit rounded-[2.25rem] p-3 xl:sticky xl:top-[92px]">
        <div className="p-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17171b] text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#17171b]">
                Control Center
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Private workspace
              </p>
            </div>
          </div>
        </div>

        <nav className="grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = section.id === activeSection;

            return (
              <button
                type="button"
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active
                    ? "bg-[#17171b] text-white shadow-[0_12px_34px_rgba(0,0,0,0.13)]"
                    : "text-slate-500 hover:bg-white hover:text-[#17171b]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? "bg-white/12 text-white"
                      : "bg-slate-950/[0.045] text-slate-500 group-hover:text-[#5B5DF5]"
                  }`}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {section.label}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-[11px] ${
                      active ? "text-white/45" : "text-slate-400"
                    }`}
                  >
                    {section.description}
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  className={active ? "text-white/38" : "text-slate-300"}
                />
              </button>
            );
          })}
          {canManageAccess ? <Link
            href="/settings/security"
            className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-slate-500 transition hover:bg-white hover:text-[#17171b]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5B5DF5]/10 text-[#5B5DF5]">
              <Users size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                Members & approvals
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                Accounts, approvals, and sessions
              </span>
            </span>
            <ChevronRight size={15} className="text-slate-300" />
          </Link> : null}
        </nav>

        <div className="mt-3 rounded-2xl border border-slate-950/[0.06] bg-white/58 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span
              className={`h-2 w-2 rounded-full ${
                databaseOnline === false
                  ? "bg-red-500"
                  : databaseOnline === true
                    ? "bg-emerald-500"
                    : "bg-slate-300"
              }`}
            />
            {databaseOnline === false
              ? "Database unavailable"
              : databaseOnline === true
                ? "Database healthy"
                : "Checking database"}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">
            {recordCount} saved workspace records · Last settings save{" "}
            {formatDate(settings.updatedAt)}
          </p>
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-5 text-white sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#17171b]">
                <activeSectionMeta.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                  System preferences
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {activeSectionMeta.label}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetSettings}
                disabled={!canManageWorkspace || !loaded || saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white/68 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <RefreshCcw size={15} />
                Reset
              </button>
              <button
                type="button"
                onClick={saveSettings}
                disabled={!canManageWorkspace || !loaded || saving || !dirty}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#17171b] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                {saved ? "Saved" : saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-xs text-white/44">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole size={13} />
              Owner and Admin
            </span>
            <span aria-hidden>·</span>
            <span>{dirty ? "Unsaved changes" : "Everything is saved"}</span>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm leading-6">{errorMessage}</p>
            </div>
          </div>
        ) : null}

        {activeSection === "appearance" ? (
          <AppearanceSection settings={settings} updateField={updateField} />
        ) : null}
        {activeSection === "alerts" ? (
          <AlertsSection
            settings={settings}
            updateField={updateField}
            playSound={playSound}
            onSave={saveSettings}
          />
        ) : null}
        {activeSection === "schedule" ? (
          <ScheduleSection settings={settings} updateField={updateField} />
        ) : null}
        {activeSection === "profile" ? (
          <ProfileSection settings={settings} updateField={updateField} />
        ) : null}
        {activeSection === "data" ? (
          <DataSection
            settings={settings}
            updateField={updateField}
            databaseOnline={databaseOnline}
            recordCount={recordCount}
            canManageAccess={canManageAccess}
          />
        ) : null}
      </div>
    </div>
  );
}

type UpdateField = <Key extends keyof DevonSettings>(
  key: Key,
  value: DevonSettings[Key]
) => void;

function AppearanceSection({
  settings,
  updateField,
}: {
  settings: DevonSettings;
  updateField: UpdateField;
}) {
  const themes: {
    value: DevonTheme;
    label: string;
    note: string;
    icon: ElementType;
  }[] = [
    {
      value: "light",
      label: "Light",
      note: "Bright platinum canvas",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      note: "Deep ink workspace",
      icon: Moon,
    },
    {
      value: "system",
      label: "Automatic",
      note: "Match this device",
      icon: Laptop,
    },
  ];

  return (
    <div className="space-y-5">
      <SettingsPanel
        eyebrow="Appearance"
        title="Choose the atmosphere."
        description="Theme changes apply instantly and stay synchronized with your saved workspace."
        icon={Palette}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const active = settings.theme === theme.value;

            return (
              <button
                type="button"
                key={theme.value}
                onClick={() => updateField("theme", theme.value)}
                aria-pressed={active}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  active
                    ? "border-[#5B5DF5]/30 bg-[#EEF2FF] shadow-[0_14px_38px_rgba(91,93,245,0.1)]"
                    : "border-slate-950/[0.07] bg-white/64 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      active
                        ? "bg-[#5B5DF5] text-white"
                        : "bg-slate-950/[0.045] text-slate-500"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  {active ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#17171b] text-white">
                      <Check size={13} />
                    </span>
                  ) : null}
                </div>
                <p className="mt-5 text-sm font-semibold text-[#17171b]">
                  {theme.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">{theme.note}</p>
              </button>
            );
          })}
        </div>
      </SettingsPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsPanel
          eyebrow="Layout"
          title="Information density"
          description="Compact mode reduces spacing without shrinking touch targets."
          icon={Gauge}
        >
          <SegmentedControl<DevonDensity>
            value={settings.density}
            options={[
              { value: "comfortable", label: "Comfortable" },
              { value: "compact", label: "Compact" },
            ]}
            onChange={(value) => updateField("density", value)}
          />
        </SettingsPanel>

        <SettingsPanel
          eyebrow="Motion"
          title="Interface movement"
          description="Reduced motion removes non-essential transitions and animated effects."
          icon={MonitorSmartphone}
        >
          <SegmentedControl<DevonMotion>
            value={settings.motion}
            options={[
              { value: "system", label: "System" },
              { value: "full", label: "Full" },
              { value: "reduced", label: "Reduced" },
            ]}
            onChange={(value) => updateField("motion", value)}
          />
        </SettingsPanel>
      </div>
    </div>
  );
}

function AlertsSection({
  settings,
  updateField,
  playSound,
  onSave,
}: {
  settings: DevonSettings;
  updateField: UpdateField;
  playSound: () => void;
  onSave: () => Promise<boolean>;
}) {
  return (
    <div className="space-y-5">
      <SettingsPanel
        eyebrow="Sound"
        title="Notification sound"
        description="Use one short chime for important confirmations and alerts."
        icon={settings.interfaceSounds ? Volume2 : VolumeX}
      >
        <PreferenceRow
          title="Interface sounds"
          description="Play the Morrow chime for important confirmations."
          control={
            <Switch
              checked={settings.interfaceSounds}
              onChange={(checked) => updateField("interfaceSounds", checked)}
              label="Interface sounds"
            />
          }
        />

        <div className="mt-3 rounded-[1.4rem] border border-slate-950/[0.07] bg-white/62 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#17171b]">
                Sound level
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {settings.soundVolume}% volume
              </p>
            </div>
            <button
              type="button"
              onClick={playSound}
              disabled={!settings.interfaceSounds}
              className="rounded-xl border border-slate-950/[0.08] bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:text-[#17171b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Preview sound
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.soundVolume}
            disabled={!settings.interfaceSounds}
            onChange={(event) =>
              updateField("soundVolume", Number(event.target.value))
            }
            aria-label="Sound volume"
            className="devon-range mt-5 w-full"
          />
        </div>
      </SettingsPanel>

      <SettingsPanel
        eyebrow="In-app center"
        title="In-app notifications"
        description="Show deadlines, daily briefs, birthdays, alerts, and delivery receipts inside Morrow."
        icon={Bell}
      >
        <PreferenceRow
          title="In-app notification center"
          description="Show saved alerts inside Morrow before any external channel is considered."
          control={
            <Switch
              checked={settings.inAppNotifications}
              onChange={(checked) => updateField("inAppNotifications", checked)}
              label="In-app notifications"
            />
          }
        />
      </SettingsPanel>

      <NotificationDeliveryCenter
        settings={settings}
        updateField={updateField}
        onSave={onSave}
      />
    </div>
  );
}

function ScheduleSection({
  settings,
  updateField,
}: {
  settings: DevonSettings;
  updateField: UpdateField;
}) {
  return (
    <div className="space-y-5">
      <SettingsPanel
        eyebrow="Schedule"
        title="Schedule and timezone"
        description="Calendar dates, daily briefs, quiet hours, and scheduled jobs use this timezone."
        icon={Clock3}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Timezone">
            <select
              value={settings.timezone}
              onChange={(event) =>
                updateField("timezone", event.target.value)
              }
              className="devon-settings-input"
            >
              {devonTimezones.map((timezone) => (
                <option key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Daily brief">
            <input
              type="time"
              value={settings.dailyBriefTime}
              onChange={(event) =>
                updateField("dailyBriefTime", event.target.value)
              }
              className="devon-settings-input"
            />
          </Field>

          <Field label="Week starts on">
            <SegmentedControl<WeekStartsOn>
              value={settings.weekStartsOn}
              options={[
                { value: "monday", label: "Monday" },
                { value: "sunday", label: "Sunday" },
              ]}
              onChange={(value) => updateField("weekStartsOn", value)}
            />
          </Field>
        </div>
      </SettingsPanel>

      <SettingsPanel
        eyebrow="Quiet hours"
        title="Protect your personal time."
        description="Non-critical notifications wait until quiet hours end. Critical alerts remain visible in the app."
        icon={Moon}
      >
        <PreferenceRow
          title="Use quiet hours"
          description="Pause sound, browser, email, and phone delivery overnight."
          control={
            <Switch
              checked={settings.quietHoursEnabled}
              onChange={(checked) =>
                updateField("quietHoursEnabled", checked)
              }
              label="Quiet hours"
            />
          }
        />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Quiet hours start">
            <input
              type="time"
              value={settings.quietHoursStart}
              disabled={!settings.quietHoursEnabled}
              onChange={(event) =>
                updateField("quietHoursStart", event.target.value)
              }
              className="devon-settings-input"
            />
          </Field>
          <Field label="Quiet hours end">
            <input
              type="time"
              value={settings.quietHoursEnd}
              disabled={!settings.quietHoursEnabled}
              onChange={(event) =>
                updateField("quietHoursEnd", event.target.value)
              }
              className="devon-settings-input"
            />
          </Field>
        </div>
      </SettingsPanel>
    </div>
  );
}

function ProfileSection({
  settings,
  updateField,
}: {
  settings: DevonSettings;
  updateField: UpdateField;
}) {
  return (
    <div className="space-y-5">
      <SettingsPanel
        eyebrow="Owner profile"
        title="Your name across Morrow."
        description="This identity appears in briefs, reports, approvals, and future account activity."
        icon={Crown}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Display name">
            <input
              value={settings.displayName}
              onChange={(event) =>
                updateField("displayName", event.target.value)
              }
              className="devon-settings-input"
            />
          </Field>
          <Field label="Role title">
            <input
              value={settings.roleTitle}
              onChange={(event) =>
                updateField("roleTitle", event.target.value)
              }
              className="devon-settings-input"
            />
          </Field>
          <Field label="Organization">
            <input
              value={settings.organization}
              onChange={(event) =>
                updateField("organization", event.target.value)
              }
              className="devon-settings-input"
            />
          </Field>
          <Field label="Signature">
            <input
              value={settings.signature}
              onChange={(event) =>
                updateField("signature", event.target.value)
              }
              className="devon-settings-input"
            />
          </Field>
          <Field label="Default tone">
            <select
              value={settings.defaultTone}
              onChange={(event) =>
                updateField("defaultTone", event.target.value as DevonTone)
              }
              className="devon-settings-input"
            >
              {devonTones.map((tone) => (
                <option key={tone}>{tone}</option>
              ))}
            </select>
          </Field>
          <Field label="Default mode">
            <select
              value={settings.defaultMode}
              onChange={(event) =>
                updateField("defaultMode", event.target.value as DevonMode)
              }
              className="devon-settings-input"
            >
              {devonModes.map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </Field>
        </div>
      </SettingsPanel>

      <SettingsPanel
        eyebrow="Communication rules"
        title="Keep every output recognizably yours."
        description="These rules will ground briefs, captions, reports, and assisted drafting."
        icon={Type}
      >
        <div className="grid gap-4">
          <TextAreaField
            label="Brand direction"
            value={settings.brandDirection}
            onChange={(value) => updateField("brandDirection", value)}
          />
          <TextAreaField
            label="Writing rules"
            value={settings.writingRules}
            onChange={(value) => updateField("writingRules", value)}
          />
          <TextAreaField
            label="Posting and approval rules"
            value={settings.postingRules}
            onChange={(value) => updateField("postingRules", value)}
          />
        </div>
      </SettingsPanel>
    </div>
  );
}

function DataSection({
  settings,
  updateField,
  databaseOnline,
  recordCount,
  canManageAccess,
}: {
  settings: DevonSettings;
  updateField: UpdateField;
  databaseOnline: boolean | null;
  recordCount: number;
  canManageAccess: boolean;
}) {
  const roles = [
    {
      name: "Owner",
      description: "Full control, including member roles and security",
      active: true,
    },
    {
      name: "Admin",
      description: "Runs the workspace, settings, and access approvals",
      active: true,
    },
    {
      name: "Contributor",
      description: "Creates and updates day-to-day workspace content",
      active: true,
    },
    {
      name: "Viewer",
      description: "Read-only access to workspace information",
      active: true,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsPanel
          eyebrow="Database"
          title={databaseOnline ? "Your records are healthy." : "Health check"}
          description={`${recordCount} records are currently stored in the private workspace database.`}
          icon={Cloud}
        >
          <div className="rounded-[1.45rem] border border-slate-950/[0.07] bg-white/62 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    databaseOnline
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <DatabaseBackup size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#17171b]">
                    Private workspace database
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Backups use the production database
                  </p>
                </div>
              </div>
              <StatusPill
                label={databaseOnline ? "Connected" : "Checking"}
                positive={Boolean(databaseOnline)}
              />
            </div>
          </div>
        </SettingsPanel>

        <SettingsPanel
          eyebrow="Backup"
          title="Download workspace data"
          description="Download every saved module as one readable JSON archive."
          icon={Download}
        >
          <a
            href="/api/backup"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#17171b] px-5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5"
          >
            <Download size={16} />
            Download full backup
          </a>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            The backup contains workspace records and preferences. It never
            includes passwords or future integration secrets.
          </p>
        </SettingsPanel>
      </div>

      <SettingsPanel
        eyebrow="Safety"
        title="Protect high-impact actions."
        description="Deletion, bulk updates, access changes, and future external publishing should require clear confirmation."
        icon={LockKeyhole}
      >
        <PreferenceRow
          title="Confirm destructive actions"
          description="Ask before deleting records, resetting settings, or replacing stored data."
          control={
            <Switch
              checked={settings.confirmDestructiveTasks}
              onChange={(checked) =>
                updateField("confirmDestructiveTasks", checked)
              }
              label="Confirm destructive actions"
            />
          }
        />
      </SettingsPanel>

      {canManageAccess ? <SettingsPanel
        eyebrow="Access model"
        title="Members, approvals, and account security."
        description="Review verified account requests, manage active members, change your password, and revoke sessions."
        icon={Users}
      >
        <Link
          href="/settings/security"
          className="mb-4 flex items-center justify-between gap-4 rounded-[1.4rem] bg-[#17171b] p-4 text-white shadow-[0_18px_55px_rgba(23,23,27,0.16)] transition hover:-translate-y-0.5"
        >
          <div>
            <p className="text-sm font-extrabold">Open identity & access</p>
            <p className="mt-1 text-xs font-semibold text-white/42">
              Members, approval requests, credentials, and active sessions.
            </p>
          </div>
          <ChevronRight size={17} className="shrink-0 text-white/55" />
        </Link>
        <div className="grid gap-3 md:grid-cols-2">
          {roles.map((role) => (
            <div
              key={role.name}
              className={`rounded-[1.4rem] border p-4 ${
                role.active
                  ? "border-[#5B5DF5]/20 bg-[#EEF2FF]/75"
                  : "border-slate-950/[0.07] bg-white/55"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#17171b]">
                  {role.name}
                </p>
                <StatusPill
                  label={role.active ? "Active" : "Locked"}
                  positive={role.active}
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </SettingsPanel> : null}
    </div>
  );
}

function SettingsPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="devon-glass rounded-[2.25rem] p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5DF5]">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#17171b]">
            {title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PreferenceRow({
  title,
  description,
  control,
  icon: Icon,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
  icon?: ElementType;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-slate-950/[0.07] bg-white/62 p-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950/[0.045] text-slate-500">
            <Icon size={15} />
          </span>
        ) : null}
        <div>
          <p className="text-sm font-semibold text-[#17171b]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-[#5B5DF5]" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SegmentedControl<Value extends string>({
  value,
  options,
  onChange,
}: {
  value: Value;
  options: { value: Value; label: string }[];
  onChange: (value: Value) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-950/[0.07] bg-slate-950/[0.035] p-1">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`min-h-10 flex-1 rounded-xl px-3 text-xs font-semibold transition ${
            value === option.value
              ? "bg-white text-[#17171b] shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {option.label}
        </button>
      ))}
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
    <label className="space-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="devon-settings-input resize-y leading-6"
      />
    </Field>
  );
}

function StatusPill({
  label,
  positive = false,
}: {
  label: string;
  positive?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        positive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {label}
    </span>
  );
}
