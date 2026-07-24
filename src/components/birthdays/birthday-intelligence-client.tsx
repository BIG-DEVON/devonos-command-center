"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Cake,
  CalendarDays,
  Check,
  ClipboardCopy,
  Crown,
  Gift,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";

type BirthdayProfile = {
  id: string;
  name: string;
  role: string;
  category: string;
  month: number;
  day: number;
  photoUrl?: string;
  notes?: string;
  preferredTone: "Formal" | "Warm" | "Public";
  createdAt: string;
};

type BirthdayForm = Omit<BirthdayProfile, "id" | "createdAt">;

type BirthdayApiResponse = {
  ok: boolean;
  profiles?: BirthdayProfile[];
  profile?: BirthdayProfile;
  message?: string;
};

const LEGACY_STORAGE_KEY = "devonos.birthdays.v1";

const categories = [
  "Department",
  "Board Member",
  "Chairman",
  "Management",
  "Stakeholder",
  "External Partner",
];

const months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const emptyForm: BirthdayForm = {
  name: "",
  role: "",
  category: "Department",
  month: 1,
  day: 1,
  photoUrl: "",
  notes: "",
  preferredTone: "Formal",
};

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getNextBirthdayDate(profile: BirthdayProfile) {
  const today = todayStart();
  const year = today.getFullYear();

  let next = new Date(year, profile.month - 1, profile.day);
  next.setHours(0, 0, 0, 0);

  if (next < today) {
    next = new Date(year + 1, profile.month - 1, profile.day);
    next.setHours(0, 0, 0, 0);
  }

  return next;
}

function getDaysUntil(profile: BirthdayProfile) {
  const today = todayStart();
  const next = getNextBirthdayDate(profile);
  const diff = next.getTime() - today.getTime();

  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatBirthday(profile: BirthdayProfile) {
  const date = new Date(2026, profile.month - 1, profile.day);

  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
  }).format(date);
}

function getBirthdayStatus(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${days} days`;
  return `In ${days} days`;
}

function buildBirthdayMessage(profile: BirthdayProfile) {
  if (profile.preferredTone === "Warm") {
    return `Happy Birthday, ${profile.name}.

Wishing you a beautiful day filled with joy, peace, laughter, and every good thing your heart desires.

May this new year bring you greater strength, deeper fulfilment, and more reasons to smile.

Have a truly amazing birthday.`;
  }

  if (profile.preferredTone === "Public") {
    return `Happy Birthday, ${profile.name}.

Today, we celebrate your service, dedication, and valuable contributions.

May this new year bring renewed strength, greater accomplishments, good health, and continued success.

Wishing you a wonderful birthday celebration.`;
  }

  return `Happy Birthday, ${profile.name}.

On this special day, we celebrate your leadership, service, and invaluable contributions.

May this new year bring you renewed strength, wisdom, good health, greater achievements, and continued fulfilment.

Wishing you a memorable and joyful birthday celebration.`;
}

export function BirthdayIntelligenceClient() {
  const [profiles, setProfiles] = useState<BirthdayProfile[]>([]);
  const [form, setForm] = useState<BirthdayForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProfiles() {
    try {
      setErrorMessage("");
      const response = await fetch("/api/birthdays", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Failed to load profiles.");

      const data = (await response.json()) as BirthdayApiResponse;
      if (!data.ok || !data.profiles) {
        throw new Error(data.message || "Invalid birthday response.");
      }

      let nextProfiles = data.profiles;

      if (nextProfiles.length === 0) {
        const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
        const legacyProfiles = legacyRaw
          ? (JSON.parse(legacyRaw) as BirthdayProfile[])
          : [];

        if (Array.isArray(legacyProfiles) && legacyProfiles.length) {
          const migrated = await Promise.all(
            legacyProfiles.map(async (profile) => {
              const migrationResponse = await fetch("/api/birthdays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
              });

              if (!migrationResponse.ok) return null;
              const migrationData =
                (await migrationResponse.json()) as BirthdayApiResponse;
              return migrationData.profile ?? null;
            })
          );

          nextProfiles = migrated.filter(
            (profile): profile is BirthdayProfile => profile !== null
          );

          if (nextProfiles.length === legacyProfiles.length) {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        }
      }

      setProfiles(nextProfiles);
      setSelectedId((current) => current ?? nextProfiles[0]?.id ?? null);
    } catch (error) {
      console.error("Failed to load birthday profiles:", error);
      setErrorMessage("Birthday profiles could not be loaded.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    void loadProfiles();
  }, []);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => getDaysUntil(a) - getDaysUntil(b));
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return sortedProfiles;

    return sortedProfiles.filter((profile) => {
      return [
        profile.name,
        profile.role,
        profile.category,
        profile.notes,
        formatBirthday(profile),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [query, sortedProfiles]);

  const todayProfiles = useMemo(() => {
    return sortedProfiles.filter((profile) => getDaysUntil(profile) === 0);
  }, [sortedProfiles]);

  const upcomingWeekProfiles = useMemo(() => {
    return sortedProfiles.filter((profile) => {
      const days = getDaysUntil(profile);
      return days >= 0 && days <= 7;
    });
  }, [sortedProfiles]);

  const selectedProfile = useMemo(() => {
    if (!selectedId) return sortedProfiles[0] ?? null;
    return profiles.find((profile) => profile.id === selectedId) ?? null;
  }, [profiles, selectedId, sortedProfiles]);

  const generatedMessage = selectedProfile
    ? buildBirthdayMessage(selectedProfile)
    : "Add a birthday profile to generate a message.";

  async function addProfile() {
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      setErrorMessage("");
      const response = await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to save profile.");
      const data = (await response.json()) as BirthdayApiResponse;
      if (!data.ok || !data.profile) {
        throw new Error(data.message || "Invalid birthday response.");
      }

      setProfiles((current) => [...current, data.profile as BirthdayProfile]);
      setSelectedId(data.profile.id);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to create birthday profile:", error);
      setErrorMessage("The birthday profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProfile(id: string) {
    try {
      setErrorMessage("");
      const response = await fetch(`/api/birthdays/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove profile.");

      setProfiles((current) =>
        current.filter((profile) => profile.id !== id)
      );

      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      console.error("Failed to remove birthday profile:", error);
      setErrorMessage("The birthday profile could not be removed.");
    }
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        {errorMessage ? (
          <div
            role="alert"
            className="rounded-[16px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {errorMessage}
          </div>
        ) : null}

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-950/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
                <Cake size={14} className="text-[#C026D3]" />
                Birthday Profiles
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B0D12]">
                Add a celebrant
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Store birthday profiles for staff, board members, chairmen,
                management, and important stakeholders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void addProfile()}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]"
            >
              <Plus size={16} />
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Full Name
              </span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Enter full name"
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Role / Title
              </span>
              <input
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
                placeholder="Director, Chairman, Staff..."
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
                    category: event.target.value,
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
                Message Tone
              </span>
              <select
                value={form.preferredTone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    preferredTone: event.target
                      .value as BirthdayForm["preferredTone"],
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                <option>Formal</option>
                <option>Warm</option>
                <option>Public</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Month
              </span>
              <select
                value={form.month}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    month: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Day
              </span>
              <input
                type="number"
                min={1}
                max={31}
                value={form.day}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    day: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Photo URL
              </span>
              <input
                value={form.photoUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    photoUrl: event.target.value,
                  }))
                }
                placeholder="Optional image link"
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
                placeholder="Preferred greeting style, department, reminders..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-950/[0.08] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </label>
          </div>
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Birthday Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search, select, and manage saved celebrants.
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
                placeholder="Search profiles..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#5B5DF5]/30 focus:bg-white focus:ring-4 focus:ring-[#5B5DF5]/10"
              />
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-slate-950/[0.12] bg-white/55 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF4FF] text-[#C026D3]">
                <Gift size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#0B0D12]">
                No birthday profiles yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add your first celebrant above and DevonOS will start tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProfiles.map((profile) => {
                const days = getDaysUntil(profile);
                const isSelected = selectedProfile?.id === profile.id;

                return (
                  <div
                    key={profile.id}
                    className={`rounded-[1.55rem] border p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)] transition duration-300 ${
                      isSelected
                        ? "border-[#5B5DF5]/25 bg-[#EEF2FF]/70"
                        : "border-slate-950/[0.08] bg-white/66 hover:bg-white"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <button
                        onClick={() => setSelectedId(profile.id)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-950/[0.045] text-slate-500">
                          {profile.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profile.photoUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound size={20} />
                          )}
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-[#0B0D12]">
                            {profile.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {profile.role || "No role added"} ·{" "}
                            {profile.category}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatBirthday(profile)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#5B5DF5]">
                            {getBirthdayStatus(days)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeProfile(profile.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/70 text-slate-400 transition duration-300 hover:bg-white hover:text-red-500"
                          aria-label="Remove profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 xl:sticky xl:top-24 xl:h-fit">
        <div className="devon-glass-dark devon-ink-shine rounded-[2.25rem] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B0D12] shadow-[0_22px_70px_rgba(255,255,255,0.18)]">
              <Crown size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">
                Birthday Watch
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Today’s celebration radar
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-2xl font-semibold">{profiles.length}</p>
              <p className="mt-1 text-xs text-white/38">Profiles</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-2xl font-semibold">{todayProfiles.length}</p>
              <p className="mt-1 text-xs text-white/38">Today</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-2xl font-semibold">
                {upcomingWeekProfiles.length}
              </p>
              <p className="mt-1 text-xs text-white/38">This week</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.55rem] border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              Next celebrant
            </p>

            {sortedProfiles[0] ? (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">
                  {sortedProfiles[0].name}
                </h3>
                <p className="mt-1 text-sm text-white/42">
                  {sortedProfiles[0].role || sortedProfiles[0].category}
                </p>
                <p className="mt-3 text-sm font-semibold text-white/72">
                  {formatBirthday(sortedProfiles[0])} ·{" "}
                  {getBirthdayStatus(getDaysUntil(sortedProfiles[0]))}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-white/48">
                No profiles saved yet.
              </p>
            )}
          </div>
        </div>

        <div className="devon-glass rounded-[2.25rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#8A6B22]">
              <Sparkles size={18} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0B0D12]">
                Message Generator
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a profile and copy the greeting.
              </p>
            </div>
          </div>

          {selectedProfile ? (
            <div className="mb-4 rounded-[1.55rem] border border-slate-950/[0.08] bg-white/66 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Selected
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#0B0D12]">
                {selectedProfile.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedProfile.preferredTone} message ·{" "}
                {formatBirthday(selectedProfile)}
              </p>
            </div>
          ) : null}

          <div className="rounded-[1.55rem] border border-slate-950/[0.08] bg-white/70 p-4">
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {generatedMessage}
            </pre>
          </div>

          <button
            onClick={copyMessage}
            disabled={!selectedProfile}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
            {copied ? "Copied" : "Copy Birthday Message"}
          </button>
        </div>

        <div className="devon-surface flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600">
            <CalendarDays size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#3c3c42]">
              {loaded ? `${profiles.length} profiles synced` : "Syncing profiles…"}
            </p>
            <p className="mt-0.5 text-xs text-[#92929a]">
              Dates are included automatically in Calendar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
