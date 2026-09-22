import { Sparkles } from "lucide-react";

export function MorrowMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`morrow-loader-mark ${compact ? "is-compact" : ""}`}
      aria-hidden="true"
    >
      <span className="morrow-loader-orbit">
        <span />
        <span />
        <span />
      </span>
      <span className="morrow-loader-letter">M</span>
    </span>
  );
}

export function MorrowInlineLoader({
  label = "Morrow is gathering the context",
}: {
  label?: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-3"
      role="status"
      aria-live="polite"
    >
      <MorrowMark compact />
      <span className="text-xs font-semibold text-slate-400">{label}</span>
    </div>
  );
}

export function MorrowPageLoader({
  label = "Bringing the workspace into focus",
}: {
  label?: string;
}) {
  return (
    <main
      className="relative min-h-[calc(100vh-72px)] overflow-hidden px-4 py-5 sm:px-6 lg:px-8"
      aria-label="Loading Morrow workspace"
    >
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_50%_18%,rgba(109,93,252,0.12),transparent_34%),radial-gradient(circle_at_88%_80%,rgba(216,183,106,0.1),transparent_30%)]" />
      <section className="relative mx-auto flex min-h-[70vh] max-w-[1500px] items-center justify-center">
        <div className="w-full max-w-xl text-center">
          <div className="mx-auto flex w-fit items-center justify-center">
            <MorrowMark />
          </div>
          <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.28em] text-slate-400">
            Morrow
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#17171b] sm:text-4xl">
            {label}
          </h1>
          <div className="mx-auto mt-7 flex max-w-sm items-center gap-3 rounded-full border border-black/[0.06] bg-white/70 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <Sparkles size={14} className="text-[#6d5dfc]" />
            <span className="morrow-loader-progress h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
              <span className="block h-full rounded-full bg-gradient-to-r from-[#6d5dfc] via-[#9f94ff] to-[#d8b76a]" />
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
