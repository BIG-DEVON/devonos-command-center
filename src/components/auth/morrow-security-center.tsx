"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Laptop,
  LoaderCircle,
  LockKeyhole,
  RotateCcwKey,
  ServerCog,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

type SecuritySession = {
  id: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
};

type SecurityPayload = {
  ok: boolean;
  owner: {
    displayName: string;
    email: string;
    role: string;
    createdAt: string;
    lastLoginAt: string | null;
    passwordChangedAt: string;
  } | null;
  sessions: SecuritySession[];
  message?: string;
};

function compactDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function compactTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function deviceDescription(userAgent: string) {
  const mobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Safari\//.test(userAgent)
        ? "Safari"
        : /Firefox\//.test(userAgent)
          ? "Firefox"
          : "Secure browser";
  const platform = /iPhone|iPad/i.test(userAgent)
    ? "iOS"
    : /Android/i.test(userAgent)
      ? "Android"
      : /Macintosh/i.test(userAgent)
        ? "Mac"
        : /Windows/i.test(userAgent)
          ? "Windows"
          : "Device";
  return { mobile, label: `${browser} on ${platform}` };
}

function passwordSignals(password: string) {
  return [
    { label: "12+ characters", active: password.length >= 12 },
    {
      label: "Upper & lowercase",
      active: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: "Number", active: /[0-9]/.test(password) },
    { label: "Symbol", active: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function MorrowSecurityCenter() {
  const [data, setData] = useState<SecurityPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const signals = useMemo(() => passwordSignals(newPassword), [newPassword]);

  async function loadSecurity() {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/security", {
        cache: "no-store",
      });
      const payload = (await response.json()) as SecurityPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Security status is unavailable.");
      }
      setData(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Security status is unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSecurity();
  }, []);

  async function revokeOtherSessions() {
    try {
      setRevoking(true);
      setError("");
      setNotice("");
      const response = await fetch("/api/auth/security", { method: "DELETE" });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Sessions could not be revoked.");
      }
      setNotice(payload.message || "Other sessions revoked.");
      await loadSecurity();
    } catch (revokeError) {
      setError(
        revokeError instanceof Error
          ? revokeError.message
          : "Sessions could not be revoked."
      );
    } finally {
      setRevoking(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setNotice("");
      const response = await fetch("/api/auth/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Password could not be changed.");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice(payload.message || "Password changed.");
      await loadSecurity();
    } catch (passwordError) {
      setError(
        passwordError instanceof Error
          ? passwordError.message
          : "Password could not be changed."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[480px] items-center justify-center rounded-[2.7rem] bg-[#0a0a0f] text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-[#9f94ff]" />
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-white/35">
            Reading the security boundary
          </p>
        </div>
      </div>
    );
  }

  const owner = data?.owner;
  const sessions = data?.sessions ?? [];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2.7rem] bg-[#0a0a0f] p-7 text-white shadow-[0_38px_110px_rgba(15,15,22,0.24)] md:p-10 lg:p-12">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_82%_8%,rgba(109,93,252,0.38),transparent_31%),radial-gradient(circle_at_10%_115%,rgba(216,183,106,0.18),transparent_38%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-200">
              <BadgeCheck size={13} />
              Protected
            </span>
            <h2 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-7xl">
              Access, members,
              <br />
              devices.
            </h2>
            <p className="mt-6 max-w-2xl text-sm font-semibold leading-7 text-white/45">
              Review credentials and every signed-in device.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur-2xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d8b76a]">
              Primary identity
            </p>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              {owner?.displayName ?? "Morrow Owner"}
            </h3>
            <p className="mt-2 text-sm font-semibold text-white/42">
              {owner?.email ?? "Owner email unavailable"}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <SecurityMetric
                value={String(sessions.length)}
                label="Active sessions"
              />
              <SecurityMetric value={owner?.role ?? "OWNER"} label="Authority" />
              <SecurityMetric
                value={compactDate(owner?.lastLoginAt ?? null)}
                label="Last sign-in"
              />
              <SecurityMetric
                value={compactDate(owner?.passwordChangedAt ?? null)}
                label="Password set"
              />
            </div>
          </div>
        </div>
      </section>

      {notice || error ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border px-5 py-4 text-sm font-bold ${
            error
              ? "border-red-100 bg-red-50 text-red-700"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || notice}
        </motion.div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="devon-v2-glass rounded-[2.3rem] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6d5dfc]">
                Session control
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Active sessions.
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Devices signed into this account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void revokeOtherSessions()}
              disabled={revoking || sessions.length <= 1}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-black/[0.07] bg-white px-4 text-xs font-extrabold text-[#17171b] transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
            >
              {revoking ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <RotateCcwKey size={15} />
              )}
              Revoke other sessions
            </button>
          </div>

          <div className="mt-7 space-y-3">
            {sessions.map((session) => {
              const device = deviceDescription(session.userAgent);
              const DeviceIcon = device.mobile ? Smartphone : Laptop;
              return (
                <article
                  key={session.id}
                  className={`flex items-center gap-4 rounded-[1.4rem] border p-4 ${
                    session.current
                      ? "border-[#6d5dfc]/15 bg-[#f1efff]"
                      : "border-black/[0.055] bg-white/65"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      session.current
                        ? "bg-[#6d5dfc] text-white"
                        : "bg-white text-slate-400 shadow-sm"
                    }`}
                  >
                    <DeviceIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-[#17171b]">
                        {device.label}
                      </p>
                      {session.current ? (
                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#6d5dfc]">
                          This device
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Last active {compactTime(session.lastSeenAt)} · expires{" "}
                      {compactDate(session.expiresAt)}
                    </p>
                  </div>
                  <Fingerprint
                    size={17}
                    className={
                      session.current ? "text-[#6d5dfc]" : "text-slate-300"
                    }
                  />
                </article>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={changePassword}
          className="overflow-hidden rounded-[2.3rem] bg-[#17171b] p-6 text-white shadow-[0_28px_90px_rgba(23,23,27,0.2)] md:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#d8b76a]">
              <KeyRound size={19} />
            </span>
            <button
              type="button"
              onClick={() => setShowPasswords((visible) => !visible)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/8 hover:text-white"
              aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
            >
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d8b76a]">
            Credential rotation
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            Change the private key.
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/42">
            Changing the password rotates this session and signs out every
            other device automatically.
          </p>

          <div className="mt-7 space-y-4">
            <PasswordInput
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              visible={showPasswords}
              autoComplete="current-password"
            />
            <PasswordInput
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showPasswords}
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showPasswords}
              autoComplete="new-password"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {signals.map((signal) => (
              <div
                key={signal.label}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-extrabold ${
                  signal.active
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/[0.055] text-white/25"
                }`}
              >
                <Check size={12} />
                {signal.label}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-xs font-extrabold text-[#17171b] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <LockKeyhole size={15} />
            )}
            Rotate password securely
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ReadinessCard
          icon={ShieldCheck}
          title="Identity foundation"
          status="Live now"
          description="Owner bootstrap, salted password hashing, server sessions, expiry, lockout, and route protection."
          ready
        />
        <ReadinessCard
          icon={Sparkles}
          title="Recovery + passkeys"
          status="Next security layer"
          description="Verified-email recovery, one-time tokens, authenticator MFA, and passkey enrollment."
        />
        <ReadinessCard
          icon={ServerCog}
          title="Hosted production"
          status="Before public launch"
          description="Managed PostgreSQL, HTTPS-only cookies, encrypted backups, alerts, and deployment secrets."
        />
      </section>
    </div>
  );
}

function SecurityMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
      <p className="truncate text-sm font-extrabold text-white/85">{value}</p>
      <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/28">
        {label}
      </p>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/30">
        {label}
      </span>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm font-extrabold text-white outline-none transition placeholder:text-white/18 focus:border-[#9f94ff]/40 focus:bg-white/10 focus:ring-4 focus:ring-[#6d5dfc]/10"
      />
    </label>
  );
}

function ReadinessCard({
  icon: Icon,
  title,
  status,
  description,
  ready = false,
}: {
  icon: typeof ShieldCheck;
  title: string;
  status: string;
  description: string;
  ready?: boolean;
}) {
  return (
    <article className="devon-v2-glass rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            ready
              ? "bg-emerald-50 text-emerald-600"
              : "bg-[#efefff] text-[#6254e8]"
          }`}
        >
          <Icon size={18} />
        </span>
        <span
          className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] ${
            ready
              ? "bg-emerald-50 text-emerald-600"
              : "bg-white text-slate-400"
          }`}
        >
          {status}
        </span>
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-[#17171b]">
        {title}
      </h3>
      <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
        {description}
      </p>
      <div className="mt-5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-300">
        {ready ? <Check size={13} /> : <Clock3 size={13} />}
        {ready ? "Implemented" : "Planned deliberately"}
      </div>
    </article>
  );
}
