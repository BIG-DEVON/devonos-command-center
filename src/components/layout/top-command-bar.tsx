"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Command,
  Crown,
  Database,
  Plus,
  Search,
  Send,
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
  return item.name ?? item.label ?? item.title ?? "DevonOS";
}

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

const pageDescriptions: Record<string, string> = {
  "/dashboard": "Your premium command overview",
  "/news": "Monitor, collect, and brief news signals",
  "/news/collector": "Capture raw news into intelligence",
  "/social": "Draft and manage social communication",
  "/birthdays": "Track birthdays and culture moments",
  "/kpi": "Monitor priorities, blockers, and outcomes",
  "/events": "Plan notable days and public moments",
  "/assets": "Organize files, links, and creative assets",
  "/reports": "Generate command reports and summaries",
  "/ai": "Create prompts, scripts, rewrites, and drafts",
  "/search": "Find anything inside DevonOS",
  "/calendar": "See upcoming dates and deadlines",
  "/projects": "Control workstreams and deliverables",
  "/command": "Launch every workspace",
  "/settings": "Define identity, rules, and preferences",
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function TopCommandBar() {
  const pathname = usePathname();

  const allItems = useMemo(
    () => [...(mainNavigation as NavigationEntry[]), ...(utilityNavigation as NavigationEntry[])],
    []
  );

  const activeItem = useMemo(() => {
    return (
      allItems
        .slice()
        .sort((a, b) => b.href.length - a.href.length)
        .find((item) => isItemActive(pathname, item.href)) ?? allItems[0]
    );
  }, [allItems, pathname]);

  const ActiveIcon = activeItem?.icon ?? Crown;
  const activeName = activeItem ? getItemName(activeItem) : "Dashboard";
  const description =
    pageDescriptions[pathname] ??
    activeItem?.description ??
    "Premium communications intelligence workspace";

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/46 px-5 py-4 backdrop-blur-3xl md:px-8">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="devon-v2-premium-border hidden h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-white/80 shadow-[0_18px_55px_rgba(37,99,235,0.12)] md:flex"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-[0_14px_34px_rgba(37,99,235,0.25)]">
              <ActiveIcon size={18} />
            </div>
          </motion.div>

          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.19em] text-slate-400">
              <span>{getGreeting()}, Big Devon</span>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="hidden text-blue-600 sm:inline">V2 Active</span>
            </div>

            <motion.div
              key={activeName}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="devon-v2-editorial truncate text-2xl text-[#07111f] md:text-3xl">
                {activeName}
              </h1>
              <p className="mt-1 hidden truncate text-sm font-semibold text-slate-400 md:block">
                {description}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <Link
            href="/search"
            className="group flex w-full max-w-[520px] items-center gap-3 rounded-[1.35rem] border border-slate-950/[0.075] bg-white/72 px-4 py-3 text-sm font-semibold text-slate-400 shadow-[0_18px_55px_rgba(15,23,42,0.055)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_24px_70px_rgba(37,99,235,0.11)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-blue-600">
              <Search size={17} />
            </div>

            <span className="flex-1 truncate text-left">
              Search modules, records, briefs, drafts...
            </span>

            <span className="flex items-center gap-1 rounded-xl border border-slate-950/[0.07] bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-400">
              <Command size={12} />
              K
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusPill icon={Database} label="Prisma" tone="blue" />
          <StatusPill icon={ShieldCheck} label="Safe" tone="cyan" />

          <Link
            href="/ai"
            className="hidden h-11 items-center justify-center gap-2 rounded-[1.1rem] border border-slate-950/[0.075] bg-white/72 px-4 text-sm font-extrabold text-slate-600 shadow-[0_16px_48px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-blue-600 md:flex"
          >
            <Bot size={16} />
            AI
          </Link>

          <Link
            href="/social"
            className="hidden h-11 items-center justify-center gap-2 rounded-[1.1rem] bg-[#07111f] px-4 text-sm font-extrabold text-white shadow-[0_18px_55px_rgba(15,23,42,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600 md:flex"
          >
            <Send size={16} />
            Post
          </Link>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-slate-950/[0.075] bg-white/72 text-slate-500 shadow-[0_16px_48px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-blue-600">
            <Bell size={17} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-white" />
          </button>

          <Link
            href="/command"
            className="devon-v2-soft-button flex h-11 w-11 items-center justify-center rounded-[1.1rem] text-white transition duration-300 hover:-translate-y-0.5"
          >
            <Plus size={18} />
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-3 hidden max-w-7xl items-center gap-2 overflow-x-auto pb-1 md:flex">
        <QuickAction href="/calendar" icon={CalendarDays} label="Calendar" />
        <QuickAction href="/projects" icon={Zap} label="Projects" />
        <QuickAction href="/reports" icon={CheckCircle2} label="Reports" />
        <QuickAction href="/assets" icon={Sparkles} label="Assets" />
      </div>
    </header>
  );
}

function StatusPill({
  icon: Icon,
  label,
  tone,
}: {
  icon: ElementType;
  label: string;
  tone: "blue" | "cyan";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-600"
      : "bg-cyan-50 text-cyan-600";

  return (
    <div className="hidden items-center gap-2 rounded-full border border-slate-950/[0.075] bg-white/70 px-3 py-2 shadow-[0_14px_40px_rgba(15,23,42,0.045)] backdrop-blur-2xl 2xl:flex">
      <span className={cx("flex h-7 w-7 items-center justify-center rounded-full", toneClass)}>
        <Icon size={14} />
      </span>
      <span className="text-xs font-extrabold text-slate-600">{label}</span>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-slate-950/[0.06] bg-white/52 px-3 py-2 text-xs font-extrabold text-slate-500 shadow-[0_12px_32px_rgba(15,23,42,0.035)] backdrop-blur-xl transition duration-300 hover:bg-white hover:text-blue-600"
    >
      <Icon size={14} className="transition duration-300 group-hover:scale-110" />
      {label}
    </Link>
  );
}