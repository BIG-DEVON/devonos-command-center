"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Check, Layers3 } from "lucide-react";
import { mainNavigation, utilityNavigation } from "@/config/navigation";

type NavigationEntry = {
  name: string;
  href: string;
  icon: ElementType;
  description?: string;
};

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationList({
  items,
  pathname,
}: {
  items: NavigationEntry[];
  pathname: string;
}) {
  return (
    <nav className="space-y-1" aria-label="Workspace navigation">
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-[13px] font-semibold transition duration-200 ${
              active
                ? "bg-[#17171b] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                : "text-[#66666f] hover:bg-black/[0.045] hover:text-[#17171b]"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] transition ${
                active
                  ? "bg-white/12 text-white"
                  : "bg-black/[0.035] text-[#85858e] group-hover:bg-white group-hover:text-[#6d5dfc]"
              }`}
            >
              <Icon size={15} strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            {active ? (
              <span className="h-1.5 w-1.5 rounded-full bg-[#9f94ff]" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 border-r border-black/[0.06] bg-white/70 p-3 backdrop-blur-2xl lg:block">
      <div className="flex h-full flex-col rounded-[22px] border border-black/[0.06] bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_18px_55px_rgba(0,0,0,0.05)]">
        <div className="p-4 pb-3">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3 rounded-2xl p-1"
            aria-label="DevonOS dashboard"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#17171b] text-sm font-bold tracking-[-0.06em] text-white shadow-[0_8px_22px_rgba(0,0,0,0.18)] transition duration-300 group-hover:scale-[1.03]">
              DO
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold tracking-[-0.035em] text-[#17171b]">
                DevonOS
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a9aa2]">
                Command Center
              </span>
            </span>
          </Link>
        </div>

        <div className="mx-4 h-px bg-black/[0.055]" />

        <div className="devon-scrollbar flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a1a1a8]">
            Workspace
          </p>
          <NavigationList
            items={mainNavigation as NavigationEntry[]}
            pathname={pathname}
          />

          <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a1a1a8]">
            System
          </p>
          <NavigationList
            items={utilityNavigation as NavigationEntry[]}
            pathname={pathname}
          />
        </div>

        <div className="p-3 pt-0">
          <Link
            href="/settings"
            className="group block rounded-[17px] border border-black/[0.055] bg-[#f6f6f8] p-3 transition hover:border-black/[0.09] hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#6d5dfc] shadow-sm">
                <Layers3 size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#34343a]">
                  Workspace online
                  <Check size={12} className="text-emerald-500" />
                </span>
                <span className="mt-0.5 block text-[11px] text-[#92929a]">
                  Local database connected
                </span>
              </span>
              <ArrowUpRight
                size={14}
                className="text-[#b0b0b7] transition group-hover:text-[#6d5dfc]"
              />
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
