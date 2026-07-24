import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <div className="devon-surface w-full max-w-lg p-7 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#f1f0ff] text-[#6d5dfc]">
          <Search size={20} />
        </span>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b9ba3]">
          404
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#25252a]">
          This workspace doesn’t exist.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#85858e]">
          The link may have moved, or the address may be incomplete.
        </p>
        <Link href="/dashboard" className="devon-primary-button mx-auto mt-6">
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
