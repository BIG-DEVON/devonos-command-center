import { Bell, Command, Plus, Search, ShieldCheck } from "lucide-react";

export function TopCommandBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-950/[0.075] bg-white/62 px-5 py-4 shadow-[0_12px_50px_rgba(15,23,42,0.045)] backdrop-blur-3xl md:px-8">
      <div className="flex items-center justify-between gap-4">
        <button className="hidden min-w-[390px] items-center gap-3 rounded-2xl border border-slate-950/[0.08] bg-white/72 px-4 py-3 text-sm text-slate-400 shadow-[0_16px_50px_rgba(15,23,42,0.045)] transition duration-300 hover:bg-white hover:text-slate-600 md:flex">
          <Search size={16} />
          Search news, birthdays, KPIs, drafts...
          <span className="ml-auto flex items-center gap-1 rounded-lg border border-slate-950/[0.08] bg-slate-950/[0.035] px-2 py-1 text-[11px] text-slate-400">
            <Command size={11} /> K
          </span>
        </button>

        <div className="hidden sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Today’s Status
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
            <ShieldCheck size={16} className="text-[#5B5DF5]" />
            Secure workspace active
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden rounded-2xl border border-slate-950/[0.08] bg-white/75 px-4 py-3 text-sm font-medium text-slate-600 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:bg-white hover:text-[#0B0D12] md:inline-flex">
            New Brief
          </button>

          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-950/[0.08] bg-white/75 text-slate-600 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:bg-white hover:text-[#0B0D12]">
            <Bell size={17} />
          </button>

          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0D12] text-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#171A23]">
            <Plus size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}