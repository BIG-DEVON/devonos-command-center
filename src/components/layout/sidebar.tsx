"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { mainNavigation, utilityNavigation } from "@/config/navigation";
import { roleLabel } from "@/lib/morrow-permissions";

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

export function Sidebar({
  displayName,
  role,
}: {
  displayName: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-black/[0.055] bg-white/88 backdrop-blur-2xl lg:block">
      <div className="flex h-full flex-col">
        <div className="px-5 pb-4 pt-5">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
            aria-label="Morrow dashboard"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#1d1d1f] text-[13px] font-bold tracking-[-0.06em] text-white shadow-[0_4px_14px_rgba(0,0,0,0.14)]">
              M
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold tracking-[-0.035em] text-[#17171b]">
                Morrow
              </span>
              <span className="mt-0.5 block text-[10px] font-medium tracking-[0.02em] text-[#8e8e93]">
                JRB workspace
              </span>
            </span>
          </Link>
        </div>

        <div className="mx-5 h-px bg-black/[0.055]" />

        <div className="devon-scrollbar flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a1a1a8]">
            Workspace
          </p>
          <NavigationList
            items={mainNavigation as NavigationEntry[]}
            pathname={pathname}
          />

          <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a1a1a8]">
            System
          </p>
          <NavigationList
            items={utilityNavigation as NavigationEntry[]}
            pathname={pathname}
          />
        </div>

        <div className="border-t border-black/[0.055] p-3">
          <button
            type="button"
            onClick={() => void signOut()}
            className="group flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition hover:bg-black/[0.035]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-bold uppercase text-[#494950]">
              {displayName.trim().charAt(0) || "M"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-[#34343a]">
                {displayName || "Morrow member"}
              </span>
              <span className="mt-0.5 block text-[10px] text-[#8e8e93]">
                {roleLabel(role)} · Sign out
              </span>
            </span>
            <LogOut size={14} className="text-[#a1a1a8] group-hover:text-[#34343a]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
