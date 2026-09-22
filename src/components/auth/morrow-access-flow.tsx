"use client";

import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Mail } from "lucide-react";
import { MorrowInlineLoader } from "@/components/ui/morrow-loading";

export type MorrowAccessMode = "signup" | "recovery" | "update-password";

export function MorrowAccessFlow({
  mode,
  onBack,
  onAuthenticated,
}: {
  mode: MorrowAccessMode;
  onBack: () => void;
  onAuthenticated: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endpoint =
      mode === "signup" ? "/api/auth/signup" : "/api/auth/password/update";
    await submit(
      endpoint,
      { displayName, email, password, confirmPassword },
      (message, authenticated) => {
        setNotice(message || (mode === "signup" ? "Check your email." : "Password updated."));
        setComplete(true);
        if (authenticated) window.setTimeout(onAuthenticated, 650);
      }
    );
  }

  async function startRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit("/api/auth/recovery/start", { email }, (message) => {
      setNotice(message || "Check your email for a secure reset link.");
      setComplete(true);
    });
  }

  async function resendVerification() {
    await submit("/api/auth/verification/resend", { email }, (message) => {
      setNotice(message || "A new verification email is on its way.");
    });
  }

  async function submit(
    endpoint: string,
    body: Record<string, string>,
    onSuccess: (message?: string, authenticated?: boolean) => void
  ) {
    try {
      setSubmitting(true);
      setError("");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        authenticated?: boolean;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Please try again.");
      }
      onSuccess(payload.message, payload.authenticated);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) {
    const title =
      mode === "signup"
        ? "Verify your email."
        : mode === "recovery"
          ? "Check your email."
          : "Password updated.";
    return (
      <AccessShell title={title} onBack={onBack}>
        <div className="pt-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf8ef] text-[#138a43]">
            {mode === "recovery" ? <Mail size={21} /> : <Check size={21} />}
          </span>
          <p className="mt-6 max-w-sm text-[15px] leading-7 text-[#6e6e73]">
            {notice}
          </p>
          {mode !== "update-password" ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onBack} className="h-12 rounded-full bg-[#1d1d1f] px-6 text-sm font-semibold text-white transition hover:bg-black">
                Back to sign in
              </button>
              {mode === "signup" ? (
                <button type="button" disabled={submitting} onClick={() => void resendVerification()} className="h-12 rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-[#1d1d1f] transition hover:border-black/20 disabled:opacity-50">
                  {submitting ? "Sending…" : "Resend email"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </AccessShell>
    );
  }

  const title =
    mode === "signup"
      ? "Create your account."
      : mode === "recovery"
        ? "Reset your password."
        : "Choose a new password.";

  return (
    <AccessShell title={title} onBack={onBack}>
      {mode === "recovery" ? (
        <form onSubmit={startRecovery} className="space-y-5">
          <Field label="Account email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="you@example.com" />
          <SubmitButton busy={submitting} label="Send reset link" />
        </form>
      ) : (
        <form onSubmit={submitCredentials} className="space-y-5">
          {mode === "signup" ? (
            <>
              <Field label="Full name" value={displayName} onChange={setDisplayName} autoComplete="name" placeholder="Full name" />
              <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="you@example.com" />
            </>
          ) : null}
          <PasswordFields password={password} confirmPassword={confirmPassword} onPassword={setPassword} onConfirm={setConfirmPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} />
          <SubmitButton busy={submitting} label={mode === "signup" ? "Create account" : "Update password"} />
        </form>
      )}

      {error ? (
        <p role="alert" className="mt-5 text-sm font-medium text-[#b42318]">
          {error}
        </p>
      ) : null}
    </AccessShell>
  );
}

function AccessShell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-[#6e6e73] transition hover:text-[#1d1d1f]">
        <ArrowLeft size={15} />
        Sign in
      </button>
      <h2 className="mt-10 max-w-md text-[clamp(2.35rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f]">
        {title}
      </h2>
      <div className="mt-10">{children}</div>
    </motion.div>
  );
}

function PasswordFields({ password, confirmPassword, onPassword, onConfirm, visible, onToggle }: { password: string; confirmPassword: string; onPassword: (value: string) => void; onConfirm: (value: string) => void; visible: boolean; onToggle: () => void }) {
  return (
    <>
      <label className="block">
        <FieldLabel>New password</FieldLabel>
        <span className="relative mt-2 block">
          <input value={password} onChange={(event) => onPassword(event.target.value)} type={visible ? "text" : "password"} autoComplete="new-password" required className="h-14 w-full rounded-2xl border border-black/10 bg-white px-4 pr-12 text-[15px] outline-none transition focus:border-[#6557ef] focus:ring-4 focus:ring-[#6557ef]/10" placeholder="12 or more characters" />
          <button type="button" onClick={onToggle} aria-label={visible ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#86868b] hover:bg-black/[0.04]">
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
      </label>
      <Field label="Confirm password" value={confirmPassword} onChange={onConfirm} type={visible ? "text" : "password"} autoComplete="new-password" placeholder="Repeat password" />
    </>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete: string; placeholder: string }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} autoComplete={autoComplete} required className="mt-2 h-14 w-full rounded-2xl border border-black/10 bg-white px-4 text-[15px] outline-none transition focus:border-[#6557ef] focus:ring-4 focus:ring-[#6557ef]/10" placeholder={placeholder} />
    </label>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold text-[#6e6e73]">{children}</span>;
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button type="submit" disabled={busy} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50">
      {busy ? <MorrowInlineLoader label="Please wait" /> : <>{label}<ArrowRight size={16} /></>}
    </button>
  );
}
