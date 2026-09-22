"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, RefreshCw } from "lucide-react";
import {
  MorrowAccessFlow,
  type MorrowAccessMode,
} from "@/components/auth/morrow-access-flow";
import { MorrowInlineLoader, MorrowMark } from "@/components/ui/morrow-loading";

type SessionStatus = {
  ok: boolean;
  authenticated: boolean;
  user: {
    displayName: string;
    email: string;
    role: string;
  } | null;
  message?: string;
};

function safeReturnTo() {
  const requested = new URLSearchParams(window.location.search).get("returnTo");
  return requested?.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/dashboard";
}

export function MorrowLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [statusReady, setStatusReady] = useState(false);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [accessMode, setAccessMode] = useState<MorrowAccessMode | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("recovery") === "1") setAccessMode("update-password");
    if (params.get("authError") === "link") {
      setError("That secure link has expired. Request a new one.");
    } else if (params.get("verified") === "1") {
      setNotice(
        params.get("pending") === "1"
          ? "Email verified. Your account is now awaiting owner approval."
          : "Email verified. You can sign in."
      );
    }

    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as SessionStatus;
        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Morrow is unavailable.");
        }
        setStatusReady(true);
        if (data.authenticated && params.get("recovery") !== "1") {
          setReady(true);
          window.setTimeout(() => {
            router.replace(safeReturnTo());
            router.refresh();
          }, 320);
        }
      })
      .catch((statusError) => {
        setError(
          statusError instanceof Error
            ? statusError.message
            : "Morrow is unavailable."
        );
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function enterWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setEntering(true);
      setError("");
      setNotice("");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Sign in could not be completed.");
      }
      openWorkspace();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Sign in could not be completed."
      );
      setEntering(false);
    }
  }

  function openWorkspace() {
    setReady(true);
    window.setTimeout(() => {
      router.push(safeReturnTo());
      router.refresh();
    }, 320);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <header className="mx-auto flex h-24 w-full max-w-[1480px] items-center px-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <MorrowMark compact />
          <span className="text-[15px] font-semibold tracking-[-0.02em]">Morrow</span>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-[1480px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden px-16 pb-20 lg:flex lg:flex-col lg:justify-end xl:px-24 xl:pb-28">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} className="max-w-[620px]">
            <h1 className="text-[clamp(4rem,6vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
              Work,<br />clearly.
            </h1>
            <p className="mt-8 max-w-sm text-[17px] leading-7 text-[#6e6e73]">
              Your secure command workspace.
            </p>
          </motion.div>
        </div>

        <div className="flex items-start justify-center px-5 pb-14 pt-4 sm:px-10 lg:items-center lg:border-l lg:border-black/[0.06] lg:px-14 lg:pb-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.65, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-[520px] rounded-[2rem] border border-black/[0.06] bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.07)] sm:p-11 lg:p-12">
            <AnimatePresence mode="wait">
              {ready ? (
                <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[440px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf8ef] text-[#138a43]"><Check size={21} /></span>
                  <h2 className="mt-7 text-4xl font-semibold tracking-[-0.05em]">Welcome.</h2>
                  <div className="mt-7"><MorrowInlineLoader label="Opening Morrow" /></div>
                </motion.div>
              ) : checking ? (
                <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[440px] items-center justify-center">
                  <MorrowInlineLoader label="Opening Morrow" />
                </motion.div>
              ) : !statusReady ? (
                <motion.div key="offline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[440px] flex-col justify-center">
                  <h2 className="text-4xl font-semibold tracking-[-0.05em]">Try again.</h2>
                  <p className="mt-4 text-sm leading-6 text-[#6e6e73]">{error}</p>
                  <button type="button" onClick={() => window.location.reload()} className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 text-sm font-semibold text-white"><RefreshCw size={14} />Reload</button>
                </motion.div>
              ) : accessMode ? (
                <MorrowAccessFlow key={accessMode} mode={accessMode} onBack={() => { setAccessMode(null); setError(""); }} onAuthenticated={openWorkspace} />
              ) : (
                <motion.form key="login" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} onSubmit={enterWorkspace}>
                  <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.055em]">Sign in.</h2>

                  <div className="mt-10 space-y-5">
                    <AuthField label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="you@example.com" />
                    <label className="block">
                      <span className="text-xs font-semibold text-[#6e6e73]">Password</span>
                      <span className="relative mt-2 block">
                        <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="current-password" required className="h-14 w-full rounded-2xl border border-black/10 bg-white px-4 pr-12 text-[15px] outline-none transition focus:border-[#6557ef] focus:ring-4 focus:ring-[#6557ef]/10" placeholder="Password" />
                        <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#86868b] hover:bg-black/[0.04]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </span>
                    </label>
                  </div>

                  {notice ? <p className="mt-5 rounded-2xl bg-[#eaf8ef] px-4 py-3 text-sm font-medium text-[#137a3d]">{notice}</p> : null}
                  {error ? <p role="alert" className="mt-5 text-sm font-medium text-[#b42318]">{error}</p> : null}
                  <button type="submit" disabled={entering} className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50">
                    {entering ? <MorrowInlineLoader label="Please wait" /> : <>Continue<ArrowRight size={16} /></>}
                  </button>

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
                    <button type="button" onClick={() => setAccessMode("recovery")} className="font-medium text-[#6e6e73] hover:text-[#1d1d1f]">Forgot password?</button>
                    <button type="button" onClick={() => setAccessMode("signup")} className="font-semibold text-[#5748e5] hover:text-[#3f32c8]">Create account</button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function AuthField({ label, value, onChange, type = "text", autoComplete, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#6e6e73]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} autoComplete={autoComplete} required className="mt-2 h-14 w-full rounded-2xl border border-black/10 bg-white px-4 text-[15px] outline-none transition focus:border-[#6557ef] focus:ring-4 focus:ring-[#6557ef]/10" placeholder={placeholder} />
    </label>
  );
}
