"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Circle,
  Command,
  Crown,
  Database,
  Gem,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { mainNavigation, utilityNavigation } from "@/config/navigation";

type NavigationEntry = {
  name?: string;
  label?: string;
  title?: string;
  href: string;
  icon: ElementType;
  badge?: string;
  description?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getItemName(item: NavigationEntry) {
  return item.name ?? item.label ?? item.title ?? "Module";
}

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

const navAccentClasses = [
  "from-blue-500 to-indigo-500",
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-indigo-500 to-violet-500",
];

function getAccent(index: number) {
  return navAccentClasses[index % navAccentClasses.length];
}

export function Sidebar() {
  const pathname = usePathname();

  const primaryItems = mainNavigation as NavigationEntry[];
  const utilityItems = utilityNavigation as NavigationEntry[];

  return (
    <aside className="sticky top-0 hidden h-screen w-[306px] shrink-0 border-r border-white/70 bg-white/58 p-4 shadow-[22px_0_80px_rgba(15,23,42,0.055)] backdrop-blur-3xl xl:block">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2.25rem] border border-slate-950/[0.07] bg-white/72 shadow-[0_28px_90px_rgba(15,23,42,0.07)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.12),transparent_34%),radial-gradient(circle_at_90%_18%,rgba(124,58,237,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,251,255,0.62))]" />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="relative z-10 p-5 pb-4">
          <Link href="/dashboard" className="group block">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="devon-v2-premium-border relative flex h-14 w-14 items-center justify-center rounded-[1.45rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_22px_60px_rgba(37,99,235,0.28)]"
              >
                <div className="absolute inset-0 rounded-[1.45rem] bg-white/10" />
                <Crown size={23} className="relative z-10" />
              </motion.div>

              <div className="min-w-0">
                <p className="devon-v2-luxury-wordmark devon-v2-shimmer-text text-[1.72rem]">
                  DevonOS
                </p>
                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Command Center
                </p>
              </div>
            </div>
          </Link>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniSignal icon={Database} label="DB" tone="blue" />
            <MiniSignal icon={Zap} label="Live" tone="violet" />
            <MiniSignal icon={ShieldCheck} label="Safe" tone="cyan" />
          </div>
        </div>

        <div className="relative z-10 px-4">
          <div className="devon-v2-dark-card rounded-[1.75rem] p-4 text-white">
            <div className="relative z-10 flex items-center gap-3">
              <div className="devon-v2-orb flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-[0_18px_48px_rgba(255,255,255,0.16)]">
                <Gem size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/38">
                  Visual System
                </p>
                <p className="mt-1 truncate text-sm font-bold text-white">
                  V2 Premium Layer
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: "18%" }}
                animate={{ width: "78%" }}
                transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-blue-300 via-cyan-200 to-violet-300"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex-1 overflow-y-auto px-4 pb-4">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Main Modules
            </p>
            <Sparkles size={14} className="text-blue-500" />
          </div>

          <nav className="space-y-1.5">
            {primaryItems.map((item, index) => {
              const name = getItemName(item);
              const active = isItemActive(pathname, item.href);
              const Icon = item.icon;
              const accent = getAccent(index);

              return (
                <motion.div
                  key={item.href}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  <Link
                    href={item.href}
                    className={cx(
                      "group relative flex items-center gap-3 overflow-hidden rounded-[1.35rem] px-3 py-3 text-sm transition duration-300",
                      active
                        ? "bg-[#07111f] text-white shadow-[0_18px_46px_rgba(15,23,42,0.20)]"
                        : "text-slate-500 hover:bg-white hover:text-[#07111f] hover:shadow-[0_16px_45px_rgba(15,23,42,0.055)]"
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-[1.35rem] bg-[#07111f]"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                    ) : null}

                    <span
                      className={cx(
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition duration-300",
                        active
                          ? `bg-gradient-to-br ${accent} text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)]`
                          : "bg-slate-950/[0.045] text-slate-500 group-hover:bg-[#EEF2FF] group-hover:text-blue-600"
                      )}
                    >
                      <Icon size={18} />
                    </span>

                    <span className="relative z-10 min-w-0 flex-1">
                      <span className="devon-v2-nav-text block truncate">
                        {name}
                      </span>
                      <span
                        className={cx(
                          "mt-0.5 block truncate text-[11px] font-semibold",
                          active ? "text-white/36" : "text-slate-350"
                        )}
                      >
                        {item.description ?? "Open workspace"}
                      </span>
                    </span>

                    <span className="relative z-10">
                      {active ? (
                        <Circle size={7} className="fill-blue-300 text-blue-300" />
                      ) : (
                        <ChevronRight
                          size={15}
                          className="text-slate-300 opacity-0 transition duration-300 group-hover:opacity-100"
                        />
                      )}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="mt-7 mb-3 flex items-center justify-between px-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Utilities
            </p>
            <Command size={14} className="text-violet-500" />
          </div>

          <nav className="space-y-1.5">
            {utilityItems.map((item, index) => {
              const name = getItemName(item);
              const active = isItemActive(pathname, item.href);
              const Icon = item.icon;
              const accent = getAccent(index + primaryItems.length);

              return (
                <motion.div
                  key={item.href}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  <Link
                    href={item.href}
                    className={cx(
                      "group flex items-center gap-3 rounded-[1.25rem] px-3 py-2.5 text-sm transition duration-300",
                      active
                        ? "bg-white text-[#07111f] shadow-[0_16px_42px_rgba(15,23,42,0.08)] ring-1 ring-blue-500/15"
                        : "text-slate-500 hover:bg-white hover:text-[#07111f] hover:shadow-[0_16px_45px_rgba(15,23,42,0.055)]"
                    )}
                  >
                    <span
                      className={cx(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition duration-300",
                        active
                          ? `bg-gradient-to-br ${accent} text-white`
                          : "bg-slate-950/[0.045] text-slate-500 group-hover:bg-[#EEF2FF] group-hover:text-blue-600"
                      )}
                    >
                      <Icon size={17} />
                    </span>

                    <span className="devon-v2-nav-text flex-1 truncate">
                      {name}
                    </span>

                    {active ? (
                      <Circle size={7} className="fill-blue-600 text-blue-600" />
                    ) : null}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        <div className="relative z-10 border-t border-slate-950/[0.07] p-4">
          <div className="rounded-[1.6rem] bg-gradient-to-br from-blue-50 via-white to-violet-50 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.055)]">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Layers3 size={15} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#07111f]">
                  Enterprise polish
                </p>
                <p className="text-[11px] font-semibold text-slate-400">
                  UI upgrade in progress
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <ColorDot className="bg-blue-500" />
              <ColorDot className="bg-violet-500" />
              <ColorDot className="bg-cyan-400" />
              <ColorDot className="bg-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MiniSignal({
  icon: Icon,
  label,
  tone,
}: {
  icon: ElementType;
  label: string;
  tone: "blue" | "violet" | "cyan";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-600"
      : tone === "violet"
        ? "bg-violet-50 text-violet-600"
        : "bg-cyan-50 text-cyan-600";

  return (
    <div className="rounded-[1.1rem] border border-slate-950/[0.06] bg-white/72 p-2 shadow-[0_14px_40px_rgba(15,23,42,0.045)]">
      <div className={cx("mx-auto flex h-8 w-8 items-center justify-center rounded-xl", toneClass)}>
        <Icon size={15} />
      </div>
      <p className="mt-1 text-center text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ColorDot({ className }: { className: string }) {
  return <div className={cx("h-1.5 rounded-full", className)} />;
}