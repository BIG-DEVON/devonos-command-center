"use client";

import type { ElementType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Cake,
  Camera,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronRight,
  Clipboard,
  Crown,
  Edit3,
  Gift,
  ImageOff,
  ImagePlus,
  LoaderCircle,
  MessageSquareText,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import {
  buildBirthdayMessage,
  formatBirthdayDate,
  formatBirthdayStatus,
  getDaysUntilBirthday,
  type BirthdayTone,
} from "@/lib/birthday-content";
import {
  hallOfFameMembers,
  type HallOfFameMember,
  type MemberGroup,
  type MemberStatus,
} from "@/data/hall-of-fame-members";

type BirthdayProfile = {
  id: string;
  name: string;
  role: string;
  category: string;
  month: number;
  day: number;
  photoUrl: string;
  hallMemberId: string | null;
  notes: string;
  preferredTone: BirthdayTone;
  createdAt: string;
  updatedAt?: string;
};

type BirthdayForm = Omit<
  BirthdayProfile,
  "id" | "createdAt" | "updatedAt"
>;

type BirthdayApiResponse = {
  ok: boolean;
  profiles?: BirthdayProfile[];
  profile?: BirthdayProfile;
  message?: string;
};

type BirthdayDraftResponse = {
  ok: boolean;
  created?: boolean;
  href?: string;
  message?: string;
};

type HallOfFameApiResponse = {
  ok: boolean;
  members?: HallOfFameMember[];
  member?: HallOfFameMember;
  message?: string;
};

type CenterView = "command" | "hall";
type BirthdayFilter = "All birthdays" | "JRB Staff";
type MemberFilter = "All portraits" | MemberGroup;

const LEGACY_STORAGE_KEY = "devonos.birthdays.v1";

const categories = [
  "JRB Staff",
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

const memberFilters: MemberFilter[] = [
  "All portraits",
  "JRB Leadership",
  "State Revenue",
  "Partner Agency",
  "Needs verification",
];

const emptyForm: BirthdayForm = {
  name: "",
  role: "",
  category: "Stakeholder",
  month: 0,
  day: 0,
  photoUrl: "",
  hallMemberId: null,
  notes: "",
  preferredTone: "Public",
};

function normalizeIdentity(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isValidBirthday(profile: Pick<BirthdayProfile, "month" | "day">) {
  if (profile.month < 1 || profile.month > 12 || profile.day < 1) return false;
  const daysInMonth = new Date(2024, profile.month, 0).getDate();
  return profile.day <= daysInMonth;
}

function getFormError(form: BirthdayForm) {
  if (!form.name.trim()) return "Add the person’s full name.";
  if (form.month < 1 || form.month > 12) return "Choose a birthday month.";

  const daysInMonth = new Date(2024, form.month, 0).getDate();
  if (form.day < 1 || form.day > daysInMonth) {
    return `Choose a valid day for ${months[form.month - 1].label}.`;
  }

  return "";
}

async function fetchBirthdayProfiles() {
  const response = await fetch("/api/birthdays", {
    method: "GET",
    cache: "no-store",
  });
  const data = (await response.json()) as BirthdayApiResponse;

  if (!response.ok || !data.ok || !data.profiles) {
    throw new Error(data.message || "Birthday profiles could not be loaded.");
  }

  return data.profiles;
}

async function fetchHallOfFameMembers() {
  const response = await fetch("/api/hall-of-fame", {
    method: "GET",
    cache: "no-store",
  });
  const data = (await response.json()) as HallOfFameApiResponse;

  if (!response.ok || !data.ok || !data.members) {
    throw new Error(data.message || "The Hall of Fame could not be loaded.");
  }
  return data.members;
}

function profileForMember(
  profiles: BirthdayProfile[],
  member: HallOfFameMember
) {
  const memberName = normalizeIdentity(member.name);
  return (
    profiles.find((profile) => profile.hallMemberId === member.id) ??
    profiles.find(
      (profile) => normalizeIdentity(profile.name) === memberName
    ) ?? null
  );
}

function profilePhoto(profile: BirthdayProfile | null) {
  return profile?.photoUrl?.trim() || "";
}

export function BirthdayIntelligenceClient() {
  const [profiles, setProfiles] = useState<BirthdayProfile[]>([]);
  const [members, setMembers] =
    useState<HallOfFameMember[]>(hallOfFameMembers);
  const [form, setForm] = useState<BirthdayForm>(emptyForm);
  const [view, setView] = useState<CenterView>("command");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState(
    hallOfFameMembers[0].id
  );
  const [birthdayQuery, setBirthdayQuery] = useState("");
  const [birthdayFilter, setBirthdayFilter] =
    useState<BirthdayFilter>("All birthdays");
  const [memberQuery, setMemberQuery] = useState("");
  const [memberFilter, setMemberFilter] =
    useState<MemberFilter>("All portraits");
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preparingId, setPreparingId] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [memberEditor, setMemberEditor] = useState<{
    mode: "add" | "edit";
    member: HallOfFameMember | null;
  } | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberDeleteCandidateId, setMemberDeleteCandidateId] = useState<
    string | null
  >(null);
  const [portraitRemovingId, setPortraitRemovingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    fetchHallOfFameMembers()
      .then((storedMembers) => {
        if (cancelled) return;
        const requestedMember = new URLSearchParams(window.location.search).get(
          "member"
        );
        const matchingMember = requestedMember
          ? storedMembers.find((member) => member.id === requestedMember)
          : null;

        setMembers(storedMembers);
        setSelectedMemberId((current) =>
          matchingMember
            ? matchingMember.id
            : storedMembers.some((member) => member.id === current)
            ? current
            : storedMembers[0]?.id ?? ""
        );
        if (window.location.hash === "#hall-of-fame" || matchingMember) {
          setView("hall");
        }
      })
      .catch((error) => {
        console.error("Failed to load Hall of Fame members:", error);
        if (!cancelled) {
          setErrorMessage("The editable Hall of Fame could not be loaded.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchBirthdayProfiles()
      .then(async (storedProfiles) => {
        let nextProfiles = storedProfiles;

        if (nextProfiles.length === 0) {
          const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
          const legacyProfiles = legacyRaw
            ? (JSON.parse(legacyRaw) as BirthdayProfile[])
            : [];

          if (Array.isArray(legacyProfiles) && legacyProfiles.length > 0) {
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
              window.localStorage.removeItem(LEGACY_STORAGE_KEY);
            }
          }
        }

        if (!cancelled) {
          setProfiles(nextProfiles);
          setSelectedId(nextProfiles[0]?.id ?? null);
        }
      })
      .catch((error) => {
        console.error("Failed to load birthday profiles:", error);
        if (!cancelled) {
          setErrorMessage("Birthday profiles could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeProfiles = useMemo(
    () => profiles.filter(isValidBirthday),
    [profiles]
  );

  const sortedProfiles = useMemo(() => {
    return [...activeProfiles].sort(
      (a, b) =>
        getDaysUntilBirthday(a.month, a.day) -
        getDaysUntilBirthday(b.month, b.day)
    );
  }, [activeProfiles]);

  const selectedProfile = useMemo(() => {
    const visibleProfiles =
      birthdayFilter === "JRB Staff"
        ? sortedProfiles.filter((profile) => profile.category === "JRB Staff")
        : sortedProfiles;
    if (!selectedId) return visibleProfiles[0] ?? null;
    return (
      visibleProfiles.find((profile) => profile.id === selectedId) ??
      visibleProfiles[0] ??
      null
    );
  }, [birthdayFilter, selectedId, sortedProfiles]);

  const selectedMember = useMemo(() => {
    return (
      members.find((member) => member.id === selectedMemberId) ??
      members[0] ??
      null
    );
  }, [members, selectedMemberId]);

  const birthdaySearchResults = useMemo(() => {
    const search = birthdayQuery.trim().toLowerCase();
    return sortedProfiles.filter((profile) => {
      if (birthdayFilter === "JRB Staff" && profile.category !== "JRB Staff") {
        return false;
      }
      if (!search) return true;
      return [
        profile.name,
        profile.role,
        profile.category,
        profile.notes,
        formatBirthdayDate(profile.month, profile.day),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [birthdayFilter, birthdayQuery, sortedProfiles]);

  const filteredMembers = useMemo(() => {
    const search = memberQuery.trim().toLowerCase();

    return members.filter((member) => {
      const filterMatches =
        memberFilter === "All portraits" || member.group === memberFilter;
      const searchMatches =
        !search ||
        [
          member.name,
          member.designation,
          member.organization,
          member.group,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return filterMatches && searchMatches;
    });
  }, [memberFilter, memberQuery, members]);

  const todayProfiles = sortedProfiles.filter(
    (profile) => getDaysUntilBirthday(profile.month, profile.day) === 0
  );
  const nextSevenDays = sortedProfiles.filter(
    (profile) => getDaysUntilBirthday(profile.month, profile.day) <= 7
  );
  const nextThirtyDays = sortedProfiles.filter(
    (profile) => getDaysUntilBirthday(profile.month, profile.day) <= 30
  );
  const matchedMemberCount = members.filter((member) =>
    profileForMember(profiles, member)
  ).length;
  const missingBirthdayCount = members.length - matchedMemberCount;
  const generatedMessage = selectedProfile
    ? buildBirthdayMessage(selectedProfile)
    : "";

  function clearNotices() {
    setErrorMessage("");
    setSuccessMessage("");
    setDraftReady(false);
  }

  function openBlankForm() {
    clearNotices();
    setBirthdayFilter("All birthdays");
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openStaffForm() {
    clearNotices();
    setBirthdayFilter("JRB Staff");
    setEditingId(null);
    setForm({ ...emptyForm, category: "JRB Staff", preferredTone: "Warm" });
    setFormOpen(true);
  }

  function openProfileForm(profile: BirthdayProfile) {
    clearNotices();
    setEditingId(profile.id);
    setSelectedId(profile.id);
    setForm({
      name: profile.name,
      role: profile.role,
      category: profile.category,
      month: profile.month,
      day: profile.day,
      photoUrl: profile.photoUrl,
      hallMemberId: profile.hallMemberId,
      notes: profile.notes,
      preferredTone: profile.preferredTone,
    });
    setFormOpen(true);
  }

  function openMemberBirthday(member: HallOfFameMember) {
    clearNotices();
    setSelectedMemberId(member.id);

    const existing = profileForMember(profiles, member);
    if (existing) {
      openProfileForm(existing);
      return;
    }

    if (member.status !== "verified") {
      setErrorMessage(
        "Confirm this member’s identity before attaching a birthday."
      );
      return;
    }

    setEditingId(null);
    setForm({
      ...emptyForm,
      name: member.name,
      role: `${member.designation} · ${member.organization}`,
      category: member.birthdayCategory,
      photoUrl: member.photoUrl,
      hallMemberId: member.id,
      preferredTone: "Public",
    });
    setFormOpen(true);
  }

  async function saveProfile() {
    const formError = getFormError(form);
    if (formError) {
      setErrorMessage(formError);
      return;
    }

    try {
      setSaving(true);
      clearNotices();

      const response = await fetch(
        editingId ? `/api/birthdays/${editingId}` : "/api/birthdays",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = (await response.json()) as BirthdayApiResponse;

      if (!response.ok || !data.ok || !data.profile) {
        throw new Error(data.message || "The birthday could not be saved.");
      }

      const savedProfile = data.profile;
      setProfiles((current) => {
        if (editingId) {
          return current.map((profile) =>
            profile.id === editingId ? savedProfile : profile
          );
        }

        return [...current, savedProfile];
      });
      setSelectedId(savedProfile.id);
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setSuccessMessage(
        editingId
          ? `${savedProfile.name}’s birthday details are updated.`
          : `${savedProfile.name} is now on the birthday watch.`
      );
      setView("command");
    } catch (error) {
      console.error("Failed to save birthday profile:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The birthday could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeProfile(id: string) {
    if (deleteCandidateId !== id) {
      setDeleteCandidateId(id);
      return;
    }

    try {
      clearNotices();
      const response = await fetch(`/api/birthdays/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("The birthday could not be removed.");

      setProfiles((current) => current.filter((profile) => profile.id !== id));
      setDeleteCandidateId(null);
      if (selectedId === id) setSelectedId(null);
      setSuccessMessage("Birthday removed from the active watch.");
    } catch (error) {
      console.error("Failed to remove birthday profile:", error);
      setErrorMessage("The birthday could not be removed.");
    }
  }

  async function saveHallMember(
    formData: FormData,
    member: HallOfFameMember | null
  ) {
    try {
      setMemberSaving(true);
      clearNotices();
      const response = await fetch(
        member ? `/api/hall-of-fame/${member.id}` : "/api/hall-of-fame",
        {
          method: member ? "PATCH" : "POST",
          body: formData,
        }
      );
      const data = (await response.json()) as HallOfFameApiResponse;
      if (!response.ok || !data.ok || !data.member) {
        throw new Error(data.message || "The Hall of Fame could not be updated.");
      }

      const saved = data.member;
      setMembers((current) =>
        (member
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved]
        ).sort((a, b) => a.photoNumber - b.photoNumber)
      );
      setSelectedMemberId(saved.id);
      setMemberEditor(null);
      setSuccessMessage(
        data.message ||
          (member
            ? `${saved.name} was updated.`
            : `${saved.name} was added to the Hall of Fame.`)
      );
      setProfiles(await fetchBirthdayProfiles());
    } catch (error) {
      console.error("Failed to save Hall of Fame member:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The Hall of Fame could not be updated."
      );
    } finally {
      setMemberSaving(false);
    }
  }

  async function removeHallMember(member: HallOfFameMember) {
    if (memberDeleteCandidateId !== member.id) {
      setMemberDeleteCandidateId(member.id);
      return;
    }

    try {
      clearNotices();
      const response = await fetch(`/api/hall-of-fame/${member.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as HallOfFameApiResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "The member could not be removed.");
      }

      const remaining = members.filter((item) => item.id !== member.id);
      setMembers(remaining);
      setSelectedMemberId(remaining[0]?.id ?? "");
      setMemberDeleteCandidateId(null);
      setSuccessMessage(data.message || `${member.name} was removed.`);
      setProfiles(await fetchBirthdayProfiles());
    } catch (error) {
      console.error("Failed to remove Hall of Fame member:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "The member could not be removed."
      );
    }
  }

  async function removeHallPortrait(member: HallOfFameMember) {
    try {
      setPortraitRemovingId(member.id);
      clearNotices();
      const response = await fetch(
        `/api/hall-of-fame/${member.id}/photo`,
        { method: "DELETE" }
      );
      const data = (await response.json()) as HallOfFameApiResponse;
      if (!response.ok || !data.ok || !data.member) {
        throw new Error(data.message || "The portrait could not be removed.");
      }

      const updatedMember = data.member;
      setMembers((current) =>
        current.map((item) =>
          item.id === updatedMember.id ? updatedMember : item
        )
      );
      setSuccessMessage(data.message || "Portrait removed.");
      setProfiles(await fetchBirthdayProfiles());
    } catch (error) {
      console.error("Failed to remove Hall of Fame portrait:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The portrait could not be removed."
      );
    } finally {
      setPortraitRemovingId(null);
    }
  }

  async function copyMessage() {
    if (!generatedMessage) return;

    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function prepareBirthdayDraft(profile: BirthdayProfile) {
    try {
      clearNotices();
      setPreparingId(profile.id);
      const response = await fetch(`/api/birthdays/${profile.id}/draft`, {
        method: "POST",
      });
      const data = (await response.json()) as BirthdayDraftResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "The social draft could not be prepared.");
      }

      setSuccessMessage(data.message || "Social Studio draft prepared.");
      setDraftReady(Boolean(data.href));
    } catch (error) {
      console.error("Failed to prepare birthday draft:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The social draft could not be prepared."
      );
    } finally {
      setPreparingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <BirthdayCenterNav
        view={view}
        setView={setView}
        profileCount={activeProfiles.length}
        memberCount={members.length}
        onAdd={openBlankForm}
      />

      {errorMessage ? (
        <Notice tone="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Notice>
      ) : null}

      {successMessage ? (
        <Notice tone="success" onClose={() => setSuccessMessage("")}>
          <span>{successMessage}</span>
          {draftReady ? (
            <Link
              href="/social"
              className="ml-2 inline-flex items-center gap-1 font-extrabold underline underline-offset-4"
            >
              Open Social Studio
              <ArrowRight size={14} />
            </Link>
          ) : null}
        </Notice>
      ) : null}

      <AnimatePresence mode="wait">
        {view === "command" ? (
          <motion.div
            key="command"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <BirthdayCommandCenter
              loaded={loaded}
              profiles={profiles}
              members={members}
              sortedProfiles={sortedProfiles}
              searchResults={birthdaySearchResults}
              selectedProfile={selectedProfile}
              selectedId={selectedId}
              birthdayQuery={birthdayQuery}
              birthdayFilter={birthdayFilter}
              todayCount={todayProfiles.length}
              weekCount={nextSevenDays.length}
              monthCount={nextThirtyDays.length}
              missingBirthdayCount={missingBirthdayCount}
              generatedMessage={generatedMessage}
              copied={copied}
              preparingId={preparingId}
              deleteCandidateId={deleteCandidateId}
              onQueryChange={setBirthdayQuery}
              onFilterChange={(filter) => {
                setBirthdayFilter(filter);
                setSelectedId(null);
              }}
              onSelect={setSelectedId}
              onEdit={openProfileForm}
              onRemove={(id) => void removeProfile(id)}
              onCopy={() => void copyMessage()}
              onPrepare={(profile) => void prepareBirthdayDraft(profile)}
              onAdd={openBlankForm}
              onAddStaff={openStaffForm}
              onOpenHall={() => setView("hall")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="hall"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <HallOfFame
              profiles={profiles}
              members={filteredMembers}
              selectedMember={selectedMember}
              allMemberCount={members.length}
              memberQuery={memberQuery}
              memberFilter={memberFilter}
              matchedMemberCount={matchedMemberCount}
              onQueryChange={setMemberQuery}
              onFilterChange={setMemberFilter}
              onSelect={setSelectedMemberId}
              onAddBirthday={openMemberBirthday}
              onAddMember={() =>
                setMemberEditor({ mode: "add", member: null })
              }
              onEditMember={(member) =>
                setMemberEditor({ mode: "edit", member })
              }
              onRemoveMember={(member) => void removeHallMember(member)}
              onRemovePortrait={(member) => void removeHallPortrait(member)}
              deleteCandidateId={memberDeleteCandidateId}
              portraitRemovingId={portraitRemovingId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BirthdayFormPanel
        open={formOpen}
        form={form}
        editing={Boolean(editingId)}
        saving={saving}
        onChange={setForm}
        onClose={() => {
          setFormOpen(false);
          setEditingId(null);
          setForm(emptyForm);
        }}
        onSave={() => void saveProfile()}
      />

      <HallMemberEditor
        open={Boolean(memberEditor)}
        member={memberEditor?.member ?? null}
        nextPhotoNumber={
          members.reduce(
            (largest, member) => Math.max(largest, member.photoNumber),
            0
          ) + 1
        }
        saving={memberSaving}
        onClose={() => setMemberEditor(null)}
        onSave={(formData) =>
          void saveHallMember(formData, memberEditor?.member ?? null)
        }
      />
    </div>
  );
}

function BirthdayCenterNav({
  view,
  setView,
  profileCount,
  memberCount,
  onAdd,
}: {
  view: CenterView;
  setView: (view: CenterView) => void;
  profileCount: number;
  memberCount: number;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.8rem] border border-slate-950/[0.07] bg-white/72 p-2 shadow-[0_18px_70px_rgba(15,23,42,0.055)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setView("command")}
          className={`flex items-center justify-center gap-2 rounded-[1.25rem] px-4 py-3 text-sm font-extrabold transition ${
            view === "command"
              ? "bg-[#07111f] text-white shadow-[0_12px_30px_rgba(7,17,31,0.18)]"
              : "text-slate-500 hover:bg-white hover:text-[#07111f]"
          }`}
        >
          <CalendarCheck size={16} />
          Birthday Command
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              view === "command" ? "bg-white/12" : "bg-slate-100"
            }`}
          >
            {profileCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setView("hall")}
          className={`flex items-center justify-center gap-2 rounded-[1.25rem] px-4 py-3 text-sm font-extrabold transition ${
            view === "hall"
              ? "bg-[#07111f] text-white shadow-[0_12px_30px_rgba(7,17,31,0.18)]"
              : "text-slate-500 hover:bg-white hover:text-[#07111f]"
          }`}
        >
          <Crown size={16} />
          Hall of Fame
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              view === "hall" ? "bg-white/12" : "bg-slate-100"
            }`}
          >
            {memberCount}
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] bg-[#eef1f6] px-5 py-3 text-sm font-extrabold text-[#07111f] transition hover:bg-[#e4e9f1]"
      >
        <Plus size={16} />
        Add birthday
      </button>
    </div>
  );
}

function BirthdayCommandCenter({
  loaded,
  profiles,
  members,
  sortedProfiles,
  searchResults,
  selectedProfile,
  selectedId,
  birthdayQuery,
  birthdayFilter,
  todayCount,
  weekCount,
  monthCount,
  missingBirthdayCount,
  generatedMessage,
  copied,
  preparingId,
  deleteCandidateId,
  onQueryChange,
  onFilterChange,
  onSelect,
  onEdit,
  onRemove,
  onCopy,
  onPrepare,
  onAdd,
  onAddStaff,
  onOpenHall,
}: {
  loaded: boolean;
  profiles: BirthdayProfile[];
  members: HallOfFameMember[];
  sortedProfiles: BirthdayProfile[];
  searchResults: BirthdayProfile[];
  selectedProfile: BirthdayProfile | null;
  selectedId: string | null;
  birthdayQuery: string;
  birthdayFilter: BirthdayFilter;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  missingBirthdayCount: number;
  generatedMessage: string;
  copied: boolean;
  preparingId: string | null;
  deleteCandidateId: string | null;
  onQueryChange: (value: string) => void;
  onFilterChange: (filter: BirthdayFilter) => void;
  onSelect: (id: string) => void;
  onEdit: (profile: BirthdayProfile) => void;
  onRemove: (id: string) => void;
  onCopy: () => void;
  onPrepare: (profile: BirthdayProfile) => void;
  onAdd: () => void;
  onAddStaff: () => void;
  onOpenHall: () => void;
}) {
  const nextProfile = sortedProfiles[0] ?? null;
  const nextDays = nextProfile
    ? getDaysUntilBirthday(nextProfile.month, nextProfile.day)
    : null;

  return (
    <div className="space-y-5" data-testid="birthday-command-center">
      <section className="relative overflow-hidden rounded-[2.8rem] bg-[#07111f] text-white shadow-[0_34px_100px_rgba(7,17,31,0.22)]">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_78%_22%,rgba(88,117,177,0.32),transparent_31%),radial-gradient(circle_at_18%_100%,rgba(184,139,63,0.15),transparent_38%)]" />

        <div className="relative grid min-h-[500px] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-between p-7 md:p-10 lg:p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/55">
                <ShieldCheck size={14} className="text-[#e2b85c]" />
                Celebration readiness
              </div>

              <h2 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white md:text-7xl">
                Never scramble for a birthday again.
              </h2>

              <p className="mt-6 max-w-xl text-base font-medium leading-8 text-white/55">
                One calm view for the next celebrant, approved portrait,
                message, and social draft. Dates stay honest; missing details
                stay visible.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#07111f] transition hover:-translate-y-0.5"
              >
                <Plus size={16} />
                Add a birthday
              </button>
              <button
                type="button"
                onClick={onAddStaff}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.07] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/12"
              >
                <UserRoundPlus size={16} />
                Add JRB staff birthday
              </button>
              <button
                type="button"
                onClick={onOpenHall}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.07] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/12"
              >
                Browse all portraits
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative min-h-[460px] overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
            {nextProfile ? (
              <>
                <ProfilePortrait
                  profile={nextProfile}
                  className="absolute inset-0"
                  imageClassName="object-cover object-top"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/8 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#f0c86b]">
                    Next celebration
                  </p>
                  <h3 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                    {nextProfile.name}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-white/52">
                    {nextProfile.role || nextProfile.category}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#07111f]">
                      {formatBirthdayDate(
                        nextProfile.month,
                        nextProfile.day
                      )}
                    </span>
                    <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-extrabold text-white">
                      {formatBirthdayStatus(nextDays ?? 0)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <EmptyPortraitStage loaded={loaded} members={members} />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <CommandMetric
          icon={Gift}
          value={todayCount}
          label="Celebrating today"
          detail={todayCount > 0 ? "Act now" : "Clear"}
          tone={todayCount > 0 ? "gold" : "neutral"}
        />
        <CommandMetric
          icon={CalendarClock}
          value={weekCount}
          label="Next 7 days"
          detail={weekCount > 0 ? "Prepare now" : "No pressure"}
          tone={weekCount > 0 ? "blue" : "neutral"}
        />
        <CommandMetric
          icon={CalendarCheck}
          value={monthCount}
          label="Next 30 days"
          detail="Planning window"
          tone="neutral"
        />
        <CommandMetric
          icon={Users}
          value={missingBirthdayCount}
          label="Dates to collect"
          detail="Portraits already ready"
          tone="neutral"
        />
      </section>

      <section className="devon-v2-glass rounded-[2.6rem] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-600">
              Upcoming runway
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#07111f] md:text-4xl">
              The next moments, already ordered.
            </h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-7 text-slate-500">
            Morrow always puts the nearest confirmed birthday first, so the
            next action is obvious.
          </p>
        </div>

        {sortedProfiles.length > 0 ? (
          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {sortedProfiles.slice(0, 4).map((profile, index) => {
              const days = getDaysUntilBirthday(profile.month, profile.day);

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => onSelect(profile.id)}
                  className={`group overflow-hidden rounded-[1.8rem] border text-left transition duration-300 hover:-translate-y-1 ${
                    selectedId === profile.id
                      ? "border-blue-500/25 bg-[#eef3ff]"
                      : "border-slate-950/[0.075] bg-white/72"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <ProfilePortrait
                      profile={profile}
                      className="absolute inset-0"
                      imageClassName="object-cover object-top transition duration-500 group-hover:scale-[1.025]"
                    />
                    <div className="absolute left-3 top-3 rounded-full border border-white/30 bg-[#07111f]/78 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
                      {index === 0
                        ? "Next"
                        : formatBirthdayStatus(days)}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-extrabold text-blue-600">
                      {formatBirthdayDate(profile.month, profile.day)}
                    </p>
                    <h3 className="mt-2 text-base font-extrabold leading-6 text-[#07111f]">
                      {profile.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-400">
                      {profile.role || profile.category}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyBirthdayRunway onAdd={onAdd} onOpenHall={onOpenHall} />
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="devon-v2-glass rounded-[2.6rem] p-6 md:p-7">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Active watch
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#07111f]">
                  Confirmed birthdays
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-500">
                {profiles.length} saved
              </span>
            </div>

            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                value={birthdayQuery}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Find a birthday..."
                className="w-full rounded-2xl border border-slate-950/[0.08] bg-white/75 py-3.5 pl-11 pr-4 text-sm font-semibold text-[#07111f] outline-none transition placeholder:text-slate-300 focus:border-blue-500/25 focus:bg-white focus:ring-4 focus:ring-blue-500/8"
              />
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Birthday groups">
              {(["All birthdays", "JRB Staff"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => onFilterChange(filter)}
                  aria-pressed={birthdayFilter === filter}
                  className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition ${
                    birthdayFilter === filter
                      ? "bg-[#07111f] text-white"
                      : "border border-slate-950/[0.08] bg-white/70 text-slate-500 hover:text-[#07111f]"
                  }`}
                >
                  {filter}
                </button>
              ))}
              {birthdayFilter === "JRB Staff" ? (
                <button
                  type="button"
                  onClick={onAddStaff}
                  className="rounded-full px-3.5 py-2 text-xs font-extrabold text-blue-600 transition hover:bg-blue-50"
                >
                  + Add staff
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 max-h-[650px] space-y-2.5 overflow-auto pr-1">
            {searchResults.length > 0 ? (
              searchResults.map((profile) => {
                const selected = selectedId === profile.id;
                const days = getDaysUntilBirthday(profile.month, profile.day);

                return (
                  <div
                    key={profile.id}
                    className={`group rounded-[1.6rem] border p-3 transition ${
                      selected
                        ? "border-blue-500/20 bg-[#eef3ff]"
                        : "border-slate-950/[0.07] bg-white/62 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onSelect(profile.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1.1rem] bg-slate-100">
                          <ProfilePortrait
                            profile={profile}
                            className="absolute inset-0"
                            imageClassName="object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-extrabold text-[#07111f]">
                            {profile.name}
                          </h3>
                          <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                            {formatBirthdayDate(profile.month, profile.day)} ·{" "}
                            {formatBirthdayStatus(days)}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(profile)}
                        aria-label={`Edit ${profile.name}`}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-blue-600"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(profile.id)}
                        aria-label={
                          deleteCandidateId === profile.id
                            ? `Confirm removal of ${profile.name}`
                            : `Remove ${profile.name}`
                        }
                        className={`inline-flex h-10 shrink-0 items-center justify-center rounded-xl transition ${
                          deleteCandidateId === profile.id
                            ? "w-auto bg-red-50 px-3 text-xs font-extrabold text-red-600"
                            : "w-10 text-slate-300 hover:bg-red-50 hover:text-red-500"
                        }`}
                      >
                        {deleteCandidateId === profile.id ? (
                          "Confirm"
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[1.7rem] border border-dashed border-slate-950/[0.11] bg-white/45 p-8 text-center">
                <CalendarClock className="mx-auto text-slate-300" size={24} />
                <p className="mt-3 text-sm font-extrabold text-[#07111f]">
                  {birthdayFilter === "JRB Staff"
                    ? "No JRB staff birthdays yet"
                    : "No confirmed birthdays yet"}
                </p>
                <p className="mt-2 text-xs font-semibold leading-6 text-slate-400">
                  {birthdayFilter === "JRB Staff"
                    ? "Add each staff member after confirming their name and birth date."
                    : "The portraits are ready. Add dates only as they are confirmed."}
                </p>
                {birthdayFilter === "JRB Staff" ? (
                  <button
                    type="button"
                    onClick={onAddStaff}
                    className="mt-4 rounded-xl bg-[#07111f] px-4 py-2.5 text-xs font-extrabold text-white"
                  >
                    Add staff birthday
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2.6rem] border border-slate-950/[0.07] bg-[#fbfaf7] shadow-[0_24px_90px_rgba(15,23,42,0.07)]">
          <div className="border-b border-slate-950/[0.07] p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#07111f] text-[#f0c86b]">
                <MessageSquareText size={18} />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Message studio
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#07111f]">
                  Ready without sounding robotic.
                </h2>
              </div>
            </div>
          </div>

          {selectedProfile ? (
            <>
              <div className="grid gap-0 border-b border-slate-950/[0.07] md:grid-cols-[160px_1fr]">
                <div className="relative min-h-[190px] bg-slate-100">
                  <ProfilePortrait
                    profile={selectedProfile}
                    className="absolute inset-0"
                    imageClassName="object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <span className="rounded-full bg-[#efe8d7] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7d632c]">
                    {selectedProfile.preferredTone} tone
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#07111f]">
                    {selectedProfile.name}
                  </h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    {selectedProfile.role || selectedProfile.category}
                  </p>
                  <p className="mt-3 text-xs font-extrabold text-blue-600">
                    {formatBirthdayDate(
                      selectedProfile.month,
                      selectedProfile.day
                    )}{" "}
                    ·{" "}
                    {formatBirthdayStatus(
                      getDaysUntilBirthday(
                        selectedProfile.month,
                        selectedProfile.day
                      )
                    )}
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-7">
                <div className="rounded-[1.7rem] border border-slate-950/[0.07] bg-white/80 p-5">
                  <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap font-sans text-sm font-medium leading-7 text-slate-700">
                    {generatedMessage}
                  </pre>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white px-5 py-3.5 text-sm font-extrabold text-[#07111f] transition hover:-translate-y-0.5"
                  >
                    {copied ? <Check size={16} /> : <Clipboard size={16} />}
                    {copied ? "Message copied" : "Copy message"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrepare(selectedProfile)}
                    disabled={preparingId === selectedProfile.id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#07111f] px-5 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {preparingId === selectedProfile.id ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {preparingId === selectedProfile.id
                      ? "Preparing..."
                      : "Prepare social draft"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center md:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efe8d7] text-[#8b6b2b]">
                <Sparkles size={22} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#07111f]">
                The studio is ready
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-7 text-slate-500">
                Add a confirmed birthday, then Morrow will prepare the message
                and Social Studio draft from the same profile.
              </p>
              <button
                type="button"
                onClick={onOpenHall}
                className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-blue-600"
              >
                Choose from Hall of Fame
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function HallOfFame({
  profiles,
  members,
  selectedMember,
  allMemberCount,
  memberQuery,
  memberFilter,
  matchedMemberCount,
  onQueryChange,
  onFilterChange,
  onSelect,
  onAddBirthday,
  onAddMember,
  onEditMember,
  onRemoveMember,
  onRemovePortrait,
  deleteCandidateId,
  portraitRemovingId,
}: {
  profiles: BirthdayProfile[];
  members: HallOfFameMember[];
  selectedMember: HallOfFameMember | null;
  allMemberCount: number;
  memberQuery: string;
  memberFilter: MemberFilter;
  matchedMemberCount: number;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: MemberFilter) => void;
  onSelect: (id: string) => void;
  onAddBirthday: (member: HallOfFameMember) => void;
  onAddMember: () => void;
  onEditMember: (member: HallOfFameMember) => void;
  onRemoveMember: (member: HallOfFameMember) => void;
  onRemovePortrait: (member: HallOfFameMember) => void;
  deleteCandidateId: string | null;
  portraitRemovingId: string | null;
}) {
  const selectedBirthday = selectedMember
    ? profileForMember(profiles, selectedMember)
    : null;
  const coverage = Math.round(
    (matchedMemberCount / Math.max(allMemberCount, 1)) * 100
  );

  return (
    <div className="space-y-5" data-testid="hall-of-fame">
      <section className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02),0_14px_42px_rgba(0,0,0,0.045)]">
        {selectedMember ? (
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[520px] overflow-hidden bg-[#1d1d1f]">
            <MemberPortrait
              member={selectedMember}
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent/5" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4">
              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
                Portrait {String(selectedMember.photoNumber).padStart(2, "0")}
              </span>
              {selectedMember.status === "verified" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1d1d1f]">
                  <BadgeCheck size={13} className="text-[#5b57d9]" />
                  Label verified
                </span>
              ) : (
                <span className="rounded-full bg-[#f2c45f] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#07111f]">
                  Details pending
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between p-7 md:p-9 lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f2f2f7] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
                <Crown size={14} />
                JRB Hall of Fame
              </div>

              <h2 className="mt-6 text-[clamp(2.5rem,5vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#1d1d1f]">
                {selectedMember.name}
              </h2>
              <p className="mt-5 text-lg font-semibold text-[#5b57d9]">
                {selectedMember.designation}
              </p>
              <p className="mt-2 max-w-xl text-sm font-medium leading-7 text-[#6e6e73]">
                {selectedMember.organization}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-950/[0.08] bg-white/70 px-3 py-1.5 text-xs font-extrabold text-slate-500">
                  {selectedMember.group}
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                    selectedBirthday
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {selectedBirthday
                    ? formatBirthdayDate(
                        selectedBirthday.month,
                        selectedBirthday.day
                      )
                    : "Birthday date pending"}
                </span>
              </div>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-3 gap-3">
                <HallMetric value={String(allMemberCount)} label="Collection" />
                <HallMetric value={String(members.length)} label="Shown now" />
                <HallMetric value={`${coverage}%`} label="Dates linked" />
              </div>

              <button
                type="button"
                onClick={() => onAddBirthday(selectedMember)}
                disabled={selectedMember.status !== "verified"}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#333336] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {selectedBirthday ? <Edit3 size={16} /> : <Cake size={16} />}
                {selectedMember.status !== "verified"
                  ? "Identity confirmation needed"
                  : selectedBirthday
                    ? "Edit birthday details"
                    : "Add birthday for this member"}
              </button>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => onEditMember(selectedMember)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/75 px-3 text-xs font-extrabold text-[#07111f] transition hover:bg-white"
                >
                  <Edit3 size={15} />
                  Edit / replace
                </button>
                <button
                  type="button"
                  onClick={() => onRemovePortrait(selectedMember)}
                  disabled={
                    !selectedMember.hasPhoto ||
                    portraitRemovingId === selectedMember.id
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-950/[0.08] bg-white/75 px-3 text-xs font-extrabold text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {portraitRemovingId === selectedMember.id ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <ImageOff size={15} />
                  )}
                  Remove image
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveMember(selectedMember)}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-extrabold transition ${
                    deleteCandidateId === selectedMember.id
                      ? "bg-red-600 text-white"
                      : "border border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                >
                  <Trash2 size={15} />
                  {deleteCandidateId === selectedMember.id
                    ? "Confirm delete"
                    : "Delete member"}
                </button>
              </div>
            </div>
          </div>
          </div>
        ) : (
          <div className="flex min-h-[520px] flex-col items-center justify-center p-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#efe7d3] text-[#765b27]">
              <UserRoundPlus size={24} />
            </span>
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#07111f]">
              Begin the collection.
            </h2>
            <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500">
              Add the first member, upload an approved portrait, and Morrow will
              keep the Hall, birthday profile, and search index aligned.
            </p>
            <button
              type="button"
              onClick={onAddMember}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#07111f] px-5 py-3.5 text-sm font-extrabold text-white"
            >
              <ImagePlus size={16} />
              Add first member
            </button>
          </div>
        )}
      </section>

      <section className="devon-v2-glass p-6 md:p-7">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5b57d9]">
              Member directory
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#1d1d1f] md:text-[2.65rem]">
              Leadership, clearly presented.
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#6e6e73]">
              Approved portraits, roles, organisations, and verification status
              in one focused directory.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row xl:max-w-xl">
            <button
              type="button"
              onClick={onAddMember}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] px-4 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition hover:bg-[#333336]"
            >
              <ImagePlus size={15} />
              Add member
            </button>
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                value={memberQuery}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search name or organisation..."
                className="w-full rounded-xl border border-black/[0.08] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#1d1d1f] outline-none transition placeholder:text-[#a1a1a6] focus:border-[#7d7aff]/35 focus:ring-4 focus:ring-[#7d7aff]/8"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {memberFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange(filter)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                memberFilter === filter
                  ? "bg-[#1d1d1f] text-white"
                  : "border border-black/[0.07] bg-white text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {members.length > 0 ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {members.map((member, index) => {
              const linkedBirthday = profileForMember(profiles, member);
              const selected = member.id === selectedMember?.id;

              return (
                <motion.button
                  key={member.id}
                  type="button"
                  onClick={() => onSelect(member.id)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(index * 0.018, 0.25),
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`group overflow-hidden rounded-[18px] border text-left shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_28px_rgba(0,0,0,0.035)] transition duration-200 hover:border-black/[0.14] hover:shadow-[0_12px_34px_rgba(0,0,0,0.06)] ${
                    selected
                      ? "border-[#7d7aff]/35 bg-[#f4f3ff] ring-4 ring-[#7d7aff]/5"
                      : "border-black/[0.06] bg-white"
                  }`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    <MemberPortrait
                      member={member}
                      sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07111f]/65 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
                        No. {String(member.photoNumber).padStart(2, "0")}
                      </span>
                      {linkedBirthday ? (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                          Date linked
                        </span>
                      ) : member.status !== "verified" ? (
                        <span className="rounded-full bg-[#f2c45f] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#07111f]">
                          Verify
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold leading-6 text-[#1d1d1f]">
                      {member.name}
                    </h3>
                    <p className="mt-2 text-xs font-semibold text-[#5b57d9]">
                      {member.designation}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-[#8e8e93]">
                      {member.organization}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      <span>{member.group}</span>
                      <ChevronRight
                        size={14}
                        className="transition group-hover:translate-x-1 group-hover:text-blue-600"
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-[2rem] border border-dashed border-slate-950/[0.1] bg-white/45 p-12 text-center">
            <Search className="mx-auto text-slate-300" size={24} />
            <h3 className="mt-4 text-lg font-extrabold text-[#07111f]">
              No portrait matches that search
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Try a name, state, organisation, or another filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function MemberPortrait({
  member,
  className,
  sizes,
  priority = false,
}: {
  member: HallOfFameMember;
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  if (member.photoUrl) {
    return (
      <Image
        src={member.photoUrl}
        alt={`Portrait of ${member.name}`}
        fill
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        className={className}
      />
    );
  }

  const initials = member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_18%,rgba(109,93,252,0.36),transparent_35%),linear-gradient(145deg,#111827,#07111f)] text-white">
      <span className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.08] text-3xl font-semibold tracking-[-0.06em] shadow-2xl">
        {initials || <UserRound size={30} />}
      </span>
      <span className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/35">
        Portrait not added
      </span>
    </div>
  );
}

function HallMemberEditor({
  open,
  member,
  nextPhotoNumber,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  member: HallOfFameMember | null;
  nextPhotoNumber: number;
  saving: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [organization, setOrganization] = useState("");
  const [group, setGroup] = useState<MemberGroup>("State Revenue");
  const [status, setStatus] = useState<MemberStatus>("verified");
  const [photoNumber, setPhotoNumber] = useState(nextPhotoNumber);
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? "");
    setDesignation(member?.designation ?? "");
    setOrganization(member?.organization ?? "");
    setGroup(member?.group ?? "State Revenue");
    setStatus(member?.status ?? "verified");
    setPhotoNumber(member?.photoNumber ?? nextPhotoNumber);
    setPhoto(null);
  }, [member, nextPhotoNumber, open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("name", name);
    formData.set("designation", designation);
    formData.set("organization", organization);
    formData.set("group", group);
    formData.set("status", status);
    formData.set("photoNumber", String(photoNumber));
    if (photo) formData.set("photo", photo);
    onSave(formData);
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close member editor"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[#07111f]/35 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="hall-member-editor-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 right-0 top-0 z-[80] flex w-full max-w-2xl flex-col border-l border-slate-950/[0.08] bg-[#f7f8fa] shadow-[-30px_0_100px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-start justify-between border-b border-slate-950/[0.07] px-6 py-6 md:px-8">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-600">
                  {member ? "Manage portrait" : "New Hall member"}
                </p>
                <h2
                  id="hall-member-editor-title"
                  className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#07111f]"
                >
                  {member
                    ? "Keep the person and picture accurate."
                    : "Add them with dignity."}
                </h2>
                <p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">
                  Changes flow into the display center, linked birthday profile,
                  and Morrow search. Uploads remain inside the database backup.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white text-slate-400 transition hover:text-[#07111f]"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="devon-scrollbar flex-1 overflow-y-auto px-6 py-6 md:px-8">
                <label className="group block cursor-pointer overflow-hidden rounded-[2rem] border border-dashed border-blue-500/20 bg-[#eef3ff] p-4 transition hover:border-blue-500/35">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) =>
                      setPhoto(event.target.files?.[0] ?? null)
                    }
                  />
                  <div className="flex items-center gap-4">
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-[1.4rem] bg-[#0a1422] shadow-lg">
                      {member ? (
                        <MemberPortrait
                          member={member}
                          sizes="96px"
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/35">
                          <Camera size={24} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-600">
                        <Upload size={15} />
                        {photo
                          ? "Portrait ready to upload"
                          : member?.hasPhoto
                            ? "Replace this portrait"
                            : "Choose a portrait"}
                      </span>
                      <p className="mt-2 truncate text-sm font-extrabold text-[#07111f]">
                        {photo?.name ??
                          (member?.hasPhoto
                            ? "Current approved image stays unless replaced"
                            : "JPEG, PNG, or WebP")}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                        Maximum 8 MB. Morrow verifies the actual image bytes,
                        not only the filename.
                      </p>
                    </div>
                  </div>
                </label>

                <div className="mt-6 grid gap-5">
                  <EditorField
                    label="Full display name"
                    value={name}
                    onChange={setName}
                    placeholder="Member’s verified name"
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <EditorField
                      label="Designation"
                      value={designation}
                      onChange={setDesignation}
                      placeholder="Executive Chairman"
                    />
                    <EditorField
                      label="Portrait number"
                      value={String(photoNumber)}
                      onChange={(value) => setPhotoNumber(Number(value))}
                      type="number"
                      placeholder="48"
                    />
                  </div>
                  <EditorField
                    label="Organisation"
                    value={organization}
                    onChange={setOrganization}
                    placeholder="State Internal Revenue Service"
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-slate-400">
                        Collection group
                      </span>
                      <select
                        value={group}
                        onChange={(event) =>
                          setGroup(event.target.value as MemberGroup)
                        }
                        className="mt-2 h-14 w-full rounded-2xl border border-black/[0.075] bg-white/85 px-4 text-sm font-extrabold text-[#07111f] outline-none focus:border-blue-500/25 focus:ring-4 focus:ring-blue-500/8"
                      >
                        {memberFilters.slice(1).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-slate-400">
                        Verification status
                      </span>
                      <select
                        value={status}
                        onChange={(event) =>
                          setStatus(event.target.value as MemberStatus)
                        }
                        className="mt-2 h-14 w-full rounded-2xl border border-black/[0.075] bg-white/85 px-4 text-sm font-extrabold text-[#07111f] outline-none focus:border-blue-500/25 focus:ring-4 focus:ring-blue-500/8"
                      >
                        <option value="verified">Verified</option>
                        <option value="name-pending">Name pending</option>
                        <option value="verification-required">
                          Verification required
                        </option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4">
                  <ShieldCheck
                    size={17}
                    className="shrink-0 text-emerald-600"
                  />
                  <p className="text-xs font-semibold leading-5 text-emerald-800/70">
                    Morrow never generates or alters the person’s face. You
                    remain in control of the approved source image.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-950/[0.07] bg-white/80 p-5 backdrop-blur-xl md:px-8">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-13 flex-1 rounded-2xl border border-slate-950/[0.08] bg-white px-4 text-sm font-extrabold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-13 flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-[#07111f] px-5 text-sm font-extrabold text-white shadow-[0_16px_40px_rgba(7,17,31,0.18)] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {saving ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : member ? (
                      <Edit3 size={16} />
                    ) : (
                      <ImagePlus size={16} />
                    )}
                    {saving
                      ? "Saving..."
                      : member
                        ? "Save member"
                        : "Add to Hall of Fame"}
                  </button>
                </div>
              </div>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function EditorField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-slate-400">
        {label}
      </span>
      <input
        type={type}
        min={type === "number" ? 1 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        className="mt-2 h-14 w-full rounded-2xl border border-black/[0.075] bg-white/85 px-4 text-sm font-extrabold text-[#07111f] outline-none transition placeholder:text-slate-300 focus:border-blue-500/25 focus:ring-4 focus:ring-blue-500/8"
      />
    </label>
  );
}

function BirthdayFormPanel({
  open,
  form,
  editing,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  form: BirthdayForm;
  editing: boolean;
  saving: boolean;
  onChange: (form: BirthdayForm) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close birthday form"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#07111f]/28 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="birthday-form-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 right-0 top-0 z-[60] flex w-full max-w-xl flex-col border-l border-slate-950/[0.08] bg-[#f7f8fa] shadow-[-30px_0_100px_rgba(15,23,42,0.16)]"
          >
            <div className="flex items-start justify-between border-b border-slate-950/[0.07] px-6 py-6 md:px-8">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-600">
                  {editing ? "Update record" : "New birthday"}
                </p>
                <h2
                  id="birthday-form-title"
                  className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#07111f]"
                >
                  {editing ? "Keep the details accurate." : "Add it once."}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  The portrait, message, calendar, and social draft will use
                  this single profile.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white text-slate-400 transition hover:text-[#07111f]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-6 md:px-8">
              {form.photoUrl ? (
                <div className="mb-6 flex items-center gap-4 rounded-[1.7rem] border border-slate-950/[0.07] bg-white/75 p-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] bg-slate-100">
                    <FormPortrait photoUrl={form.photoUrl} name={form.name} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      Approved portrait
                    </p>
                    <p className="mt-2 truncate text-sm font-extrabold text-[#07111f]">
                      {form.name || "New profile"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      This image will follow the birthday record.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-5">
                <FormField label="Full name">
                  <input
                    value={form.name}
                    onChange={(event) =>
                      onChange({ ...form, name: event.target.value })
                    }
                    placeholder="Enter full name"
                    className={formInputClass}
                  />
                </FormField>

                <FormField label="Designation / organisation">
                  <input
                    value={form.role}
                    onChange={(event) =>
                      onChange({ ...form, role: event.target.value })
                    }
                    placeholder="Chairman · Organisation"
                    className={formInputClass}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Month">
                    <select
                      value={form.month}
                      onChange={(event) =>
                        onChange({
                          ...form,
                          month: Number(event.target.value),
                        })
                      }
                      className={formInputClass}
                    >
                      <option value={0}>Choose month</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Day">
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={form.day || ""}
                      onChange={(event) =>
                        onChange({
                          ...form,
                          day: Number(event.target.value),
                        })
                      }
                      placeholder="Day"
                      className={formInputClass}
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Category">
                    <select
                      value={form.category}
                      onChange={(event) =>
                        onChange({ ...form, category: event.target.value })
                      }
                      className={formInputClass}
                    >
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Message tone">
                    <select
                      value={form.preferredTone}
                      onChange={(event) =>
                        onChange({
                          ...form,
                          preferredTone: event.target.value as BirthdayTone,
                        })
                      }
                      className={formInputClass}
                    >
                      <option>Formal</option>
                      <option>Warm</option>
                      <option>Public</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Portrait path">
                  <input
                    value={form.photoUrl}
                    onChange={(event) =>
                      onChange({ ...form, photoUrl: event.target.value })
                    }
                    placeholder="/members/portrait.jpg or approved URL"
                    className={formInputClass}
                  />
                </FormField>

                <FormField label="Context notes">
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      onChange({ ...form, notes: event.target.value })
                    }
                    rows={4}
                    placeholder="Preferences, protocol notes, context, or reminders..."
                    className={`${formInputClass} resize-none leading-6`}
                  />
                </FormField>
              </div>
            </div>

            <div className="border-t border-slate-950/[0.07] bg-white/80 p-5 backdrop-blur-xl md:px-8">
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#07111f] px-6 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {saving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <CalendarCheck size={16} />
                )}
                {saving
                  ? "Saving birthday..."
                  : editing
                    ? "Save accurate details"
                    : "Add to birthday watch"}
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

const formInputClass =
  "w-full rounded-2xl border border-slate-950/[0.08] bg-white/85 px-4 py-3.5 text-sm font-semibold text-[#07111f] outline-none transition placeholder:text-slate-300 focus:border-blue-500/25 focus:bg-white focus:ring-4 focus:ring-blue-500/8";

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Notice({
  tone,
  onClose,
  children,
}: {
  tone: "success" | "error";
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-4 rounded-[1.6rem] border px-5 py-4 text-sm font-semibold leading-6 ${
        tone === "error"
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-blue-100 bg-blue-50 text-blue-700"
      }`}
    >
      <div>{children}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss message"
        className="mt-0.5 shrink-0 opacity-55 transition hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function CommandMetric({
  icon: Icon,
  value,
  label,
  detail,
  tone,
}: {
  icon: ElementType;
  value: number;
  label: string;
  detail: string;
  tone: "gold" | "blue" | "neutral";
}) {
  const toneClass =
    tone === "gold"
      ? "bg-[#f6eedc] text-[#8a6a2c]"
      : tone === "blue"
        ? "bg-blue-50 text-blue-600"
        : "bg-slate-100 text-slate-500";

  return (
    <div className="rounded-[1.8rem] border border-slate-950/[0.07] bg-white/76 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.055)] backdrop-blur-xl">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[1rem] ${toneClass}`}
      >
        <Icon size={17} />
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-4xl font-semibold tracking-[-0.05em] text-[#07111f]">
            {value}
          </p>
          <p className="mt-1 text-xs font-extrabold text-slate-500">{label}</p>
        </div>
        <p className="text-right text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-300">
          {detail}
        </p>
      </div>
    </div>
  );
}

function HallMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-950/[0.07] bg-white/68 p-4">
      <p className="text-2xl font-semibold tracking-[-0.04em] text-[#07111f]">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function EmptyBirthdayRunway({
  onAdd,
  onOpenHall,
}: {
  onAdd: () => void;
  onOpenHall: () => void;
}) {
  return (
    <div className="mt-7 grid gap-4 rounded-[2rem] border border-dashed border-slate-950/[0.11] bg-white/45 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#07111f]">
          Portraits are ready. Dates are still being collected.
        </h3>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
          No placeholder birthdays have been invented. Add each date when it is
          confirmed and the runway will order itself automatically.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenHall}
          className="rounded-2xl border border-slate-950/[0.08] bg-white px-4 py-3 text-sm font-extrabold text-[#07111f]"
        >
          Choose portrait
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-2xl bg-[#07111f] px-4 py-3 text-sm font-extrabold text-white"
        >
          Add birthday
        </button>
      </div>
    </div>
  );
}

function EmptyPortraitStage({
  loaded,
  members,
}: {
  loaded: boolean;
  members: HallOfFameMember[];
}) {
  const previewMembers = members.slice(0, 3);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0d1928] p-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center -space-x-7">
          {previewMembers.map((member, index) => (
            <div
              key={member.id}
              className="relative h-32 w-28 overflow-hidden rounded-[1.5rem] border-4 border-[#0d1928] bg-slate-800 shadow-2xl"
              style={{ transform: `rotate(${(index - 1) * 4}deg)` }}
            >
              <MemberPortrait
                member={member}
                sizes="112px"
                className="object-cover object-top"
              />
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm font-extrabold text-white">
          {loaded
            ? `${members.length} Hall of Fame ${members.length === 1 ? "member" : "members"} ready`
            : "Loading birthday watch"}
        </p>
        <p className="mt-2 text-center text-xs font-semibold leading-6 text-white/40">
          Add confirmed dates and the nearest birthday will appear here.
        </p>
      </div>
    </div>
  );
}

function ProfilePortrait({
  profile,
  className,
  imageClassName,
  priority = false,
}: {
  profile: BirthdayProfile;
  className: string;
  imageClassName: string;
  priority?: boolean;
}) {
  const photo = profilePhoto(profile);

  return (
    <div className={className}>
      {photo.startsWith("/") ? (
        <Image
          src={photo}
          alt={`Portrait of ${profile.name}`}
          fill
          loading={priority ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 48vw, 100vw"
          className={imageClassName}
        />
      ) : photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={`Portrait of ${profile.name}`}
          className={`h-full w-full ${imageClassName}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
          <UserRound size={30} />
        </div>
      )}
    </div>
  );
}

function FormPortrait({
  photoUrl,
  name,
}: {
  photoUrl: string;
  name: string;
}) {
  if (photoUrl.startsWith("/")) {
    return (
      <Image
        src={photoUrl}
        alt={`Portrait of ${name}`}
        fill
        sizes="80px"
        className="object-cover object-top"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt={`Portrait of ${name}`}
      className="h-full w-full object-cover object-top"
    />
  );
}

export default BirthdayIntelligenceClient;
