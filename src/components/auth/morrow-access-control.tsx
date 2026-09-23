"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  UserX,
  X,
} from "lucide-react";
import { roleDescription, roleLabel } from "@/lib/morrow-permissions";

type AccessRequest = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  organization: string;
  reason: string;
  requestedRole: string;
  status: string;
  createdAt: string;
};

type Member = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
};

type AccessPayload = {
  ok: boolean;
  requests: AccessRequest[];
  users: Member[];
  message?: string;
};

function compactDate(value: string | null) {
  if (!value) return "Not signed in";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function MorrowAccessControl({ currentRole }: { currentRole: string }) {
  const [data, setData] = useState<AccessPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [requestRoles, setRequestRoles] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/access-requests", {
        cache: "no-store",
      });
      const payload = (await response.json()) as AccessPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Access control is unavailable.");
      }
      setData(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Access control is unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function review(id: string, action: "approve" | "reject") {
    try {
      setWorkingId(id);
      setNotice("");
      setError("");
      const response = await fetch(`/api/auth/access-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          role: requestRoles[id] ?? "MEMBER",
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "That review could not be completed.");
      }
      setNotice(payload.message || "Access updated.");
      await load();
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "That review could not be completed."
      );
    } finally {
      setWorkingId("");
    }
  }

  async function updateMember(
    id: string,
    change: { role?: string; status?: string }
  ) {
    try {
      setWorkingId(id);
      setNotice("");
      setError("");
      const response = await fetch(`/api/auth/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(change),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "That member could not be updated.");
      }
      setNotice(payload.message || "Member updated.");
      await load();
    } catch (memberError) {
      setError(
        memberError instanceof Error
          ? memberError.message
          : "That member could not be updated."
      );
    } finally {
      setWorkingId("");
    }
  }

  const requests = data?.requests ?? [];
  const users = data?.users ?? [];
  const pending = requests.filter((request) => request.status === "PENDING");

  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="rounded-[2.3rem] border border-black/[0.055] bg-white/70 p-6 shadow-[0_22px_70px_rgba(24,24,31,0.06)] backdrop-blur-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6d5dfc]">Approval queue</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#17171b]">Pending access</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Approve each verified person and choose the access they need.</p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#efedff] text-[#6d5dfc]">
            <UserRoundCheck size={20} />
          </span>
        </div>

        {notice || error ? (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={`mt-5 rounded-2xl border px-4 py-3 text-xs font-bold ${error ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
            {error || notice}
          </motion.p>
        ) : null}

        <div className="mt-6 space-y-3">
          {loading && !data ? (
            <div className="flex min-h-44 items-center justify-center text-slate-400"><LoaderCircle size={20} className="animate-spin" /></div>
          ) : pending.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-black/[0.09] bg-[#f8f7f3] px-6 py-9 text-center">
              <ShieldCheck size={22} className="mx-auto text-emerald-600" />
              <p className="mt-3 text-sm font-extrabold text-[#17171b]">Approval queue is clear</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">New account requests will appear here.</p>
            </div>
          ) : pending.map((request) => (
            <article key={request.id} className="rounded-[1.5rem] border border-black/[0.055] bg-[#f8f7f3] p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#17171b]">{request.displayName}</h3>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-amber-700"><Clock3 size={10} className="mr-1 inline" />Pending</span>
                  </div>
                  <p className="mt-1 truncate text-xs font-bold text-slate-500">{request.email}</p>
                  <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-400">{request.organization || "Organisation not supplied"}{request.reason ? ` · ${request.reason}` : ""}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <select
                    value={requestRoles[request.id] ?? "MEMBER"}
                    onChange={(event) =>
                      setRequestRoles((current) => ({
                        ...current,
                        [request.id]: event.target.value,
                      }))
                    }
                    className="h-10 rounded-xl border border-black/[0.07] bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:border-violet-300"
                    aria-label={`Role for ${request.displayName}`}
                  >
                    <option value="MEMBER">Contributor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button type="button" disabled={Boolean(workingId)} onClick={() => void review(request.id, "reject")} className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-black/[0.07] bg-white px-3 text-[10px] font-extrabold text-slate-500 transition hover:text-red-600 disabled:opacity-45"><X size={13} />Decline</button>
                  <button type="button" disabled={Boolean(workingId)} onClick={() => void review(request.id, "approve")} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#17171b] px-3 text-[10px] font-extrabold text-white transition hover:-translate-y-0.5 disabled:opacity-45">{workingId === request.id ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}Approve</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-[2.3rem] border border-black/[0.055] bg-[#0a0a0f] p-6 text-white shadow-[0_22px_70px_rgba(24,24,31,0.16)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9f94ff]">Member directory</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{users.length} account{users.length === 1 ? "" : "s"}</h2>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh members" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white/55 transition hover:text-white"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
        </div>

        <div className="mt-6 space-y-2.5">
          {users.map((user) => (
            <article key={user.id} className="rounded-[1.3rem] border border-white/[0.075] bg-white/[0.055] p-4">
              <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-[#9f94ff]"><UsersRound size={16} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="truncate text-xs font-extrabold">{user.displayName}</p><span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.1em] ${user.status === "ACTIVE" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-300/10 text-amber-200"}`}>{user.status}</span></div>
                <p className="mt-1 truncate text-[10px] font-semibold text-white/35">{user.email} · {roleLabel(user.role)}</p>
              </div>
              <div className="text-right"><p className="text-[9px] font-bold text-white/25">{compactDate(user.lastLoginAt)}</p></div>
              </div>
              <p className="mt-3 text-[10px] leading-4 text-white/35">{roleDescription(user.role)}</p>
              {currentRole === "OWNER" && user.role !== "OWNER" ? (
                <div className="mt-3 flex gap-2 border-t border-white/[0.07] pt-3">
                  <select
                    value={user.role}
                    onChange={(event) =>
                      void updateMember(user.id, { role: event.target.value })
                    }
                    disabled={Boolean(workingId)}
                    className="h-9 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.07] px-3 text-[10px] font-bold text-white outline-none disabled:opacity-45"
                    aria-label={`Change role for ${user.displayName}`}
                  >
                    <option className="text-black" value="ADMIN">Admin</option>
                    <option className="text-black" value="MEMBER">Contributor</option>
                    <option className="text-black" value="VIEWER">Viewer</option>
                  </select>
                  <button
                    type="button"
                    disabled={Boolean(workingId)}
                    onClick={() =>
                      void updateMember(user.id, {
                        status: user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                      })
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-[10px] font-bold text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-45"
                  >
                    <UserX size={12} />
                    {user.status === "ACTIVE" ? "Suspend" : "Restore"}
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
