"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavigation, utilityNavigation } from "@/config/navigation";
import { Crown, Sparkles } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[292px] shrink-0 border-r border-slate-950/[0.08] bg-white/55 px-4 py-5 shadow-[18px_0_70px_rgba(15,23,42,0.045)] backdrop-blur-3xl lg:block">
      <div className="mb-7 rounded-[1.65rem] border border-slate-950/[0.08] bg-white/75 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.075)] backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B0D12] text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <Crown size={20} />
          </div>

          <div>
            <h1 className="text-base font-semibold tracking-tight text-[#0B0D12]">
              DevonOS
            </h1>
            <p className="text-xs text-slate-500">Command Center</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#D8B76A]/25 bg-[#FFF8E1]/60 px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#8A6B22]">
            <Sparkles size={13} />
            Prime intelligence active
          </div>
        </div>
      </div>

      <nav className="space-y-7">
        <div>
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1.5">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition duration-300",
                    isActive
                      ? "bg-[#0B0D12] text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
                      : "text-slate-500 hover:bg-white/80 hover:text-[#0B0D12] hover:shadow-[0_14px_40px_rgba(15,23,42,0.07)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition duration-300",
                      isActive
                        ? "bg-white/10 text-white"
                        : "bg-slate-950/[0.045] text-slate-400 group-hover:bg-[#EEF2FF] group-hover:text-[#5B5DF5]"
                    )}
                  >
                    <Icon size={17} />
                  </span>

                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Utility
          </p>

          <div className="space-y-1.5">
            {utilityNavigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition duration-300",
                    isActive
                      ? "bg-[#0B0D12] text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
                      : "text-slate-400 hover:bg-white/80 hover:text-[#0B0D12] hover:shadow-[0_14px_40px_rgba(15,23,42,0.07)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition duration-300",
                      isActive
                        ? "bg-white/10 text-white"
                        : "bg-slate-950/[0.04] text-slate-400 group-hover:bg-slate-950/[0.055] group-hover:text-[#0B0D12]"
                    )}
                  >
                    <Icon size={17} />
                  </span>

                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mt-8 rounded-[1.5rem] border border-slate-950/[0.08] bg-gradient-to-br from-white/85 to-slate-50/75 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Today
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
          12 signals found. 2 KPIs require attention.
        </p>
      </div>
    </aside>
  );
}