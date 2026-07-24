"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <div className="devon-surface w-full max-w-lg p-7 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-rose-50 text-rose-600">
          <AlertTriangle size={20} />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.045em] text-[#25252a]">
          This workspace hit a snag.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#85858e]">
          Your data is safe. Try loading this view again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="devon-primary-button mx-auto mt-6"
        >
          <RefreshCcw size={15} />
          Try again
        </button>
      </div>
    </main>
  );
}
