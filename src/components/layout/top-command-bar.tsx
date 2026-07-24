"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  Command,
  Gauge,
  Menu,
  Newspaper,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { mainNavigation, utilityNavigation } from "@/config/navigation";

type NavigationEntry = {
  name: string;
  href: string;
  icon: ElementType;
  description: string;
};

const allNavigation = [
  ...(mainNavigation as NavigationEntry[]),
  ...(utilityNavigation as NavigationEntry[]),
];

const quickCreate = [
  {
    label: "New project",
    description: "Plan a workstream",
    href: "/projects",
    icon: Briefcase,
  },
  {
    label: "Social draft",
    description: "Prepare a post",
    href: "/social",
    icon: Send,
  },
  {
    label: "AI draft",
    description: "Start with a brief",
    href: "/ai",
    icon: Sparkles,
  },
  {
    label: "News brief",
    description: "Collect a signal",
    href: "/news/collector",
    icon: Newspaper,
  },
];

const initialNotifications = [
  {
    id: "autopilot",
    title: "Your action queue is ready",
    detail: "Review today’s highest-priority signals.",
    href: "/autopilot",
    time: "Now",
  },
  {
    id: "calendar",
    title: "Calendar is in sync",
    detail: "Upcoming moments are available to review.",
    href: "/calendar",
    time: "Today",
  },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function TopCommandBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);

  const activeItem =
    allNavigation
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isItemActive(pathname, item.href)) ?? allNavigation[0];

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allNavigation;

    return allNavigation.filter((item) =>
      `${item.name} ${item.description}`.toLowerCase().includes(normalized)
    );
  }, [query]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }

      if (event.key === "Escape") {
        setPaletteOpen(false);
        setMobileOpen(false);
        setNotificationsOpen(false);
        setCreateOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setPaletteOpen(false);
    setNotificationsOpen(false);
    setCreateOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!paletteOpen) return;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [paletteOpen]);

  function openPalette() {
    setQuery("");
    setPaletteOpen(true);
  }

  function navigateTo(href: string) {
    setPaletteOpen(false);
    router.push(href);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/[0.055] bg-[#f6f6f8]/82 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="devon-icon-button lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>

            <Link
              href="/dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#17171b] text-[11px] font-bold text-white lg:hidden"
              aria-label="DevonOS dashboard"
            >
              DO
            </Link>

            <div className="min-w-0">
              <p className="hidden text-[11px] font-semibold text-[#92929a] sm:block">
                {getGreeting()}, Big Devon
              </p>
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[18px] font-bold tracking-[-0.035em] text-[#1d1d21] sm:text-[20px]">
                  {activeItem.name}
                </h1>
                <ChevronRight
                  size={14}
                  className="hidden text-[#c1c1c7] sm:block"
                />
                <span className="hidden truncate text-xs text-[#96969e] md:block">
                  {activeItem.description}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openPalette}
            className="group hidden h-10 w-full max-w-[410px] items-center gap-3 rounded-[13px] border border-black/[0.07] bg-white/75 px-3 text-left text-[13px] text-[#9a9aa2] shadow-[0_1px_2px_rgba(0,0,0,0.025)] transition hover:border-black/[0.11] hover:bg-white md:flex"
          >
            <Search size={15} />
            <span className="flex-1">Search or jump anywhere</span>
            <kbd className="flex items-center gap-1 rounded-[7px] border border-black/[0.07] bg-[#f6f6f8] px-2 py-1 text-[10px] font-semibold text-[#85858e]">
              <Command size={10} />
              K
            </kbd>
          </button>

          <div className="relative flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openPalette}
              className="devon-icon-button md:hidden"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setCreateOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
                className="devon-primary-button h-10"
                aria-haspopup="menu"
                aria-expanded={createOpen}
              >
                <Plus size={15} />
                New
              </button>

              {createOpen ? (
                <PopoverCard label="Create new">
                  <div className="grid gap-1 p-1">
                    {quickCreate.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-[13px] p-2.5 transition hover:bg-black/[0.04]"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#f1f0ff] text-[#6d5dfc]">
                            <Icon size={16} />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-[#2d2d32]">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-[#97979f]">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </PopoverCard>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setCreateOpen(false);
                }}
                className="devon-icon-button relative"
                aria-label={`${notifications.length} notifications`}
                aria-expanded={notificationsOpen}
              >
                <Bell size={17} />
                {notifications.length ? (
                  <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#6d5dfc] ring-2 ring-white" />
                ) : null}
              </button>

              {notificationsOpen ? (
                <PopoverCard label="Notifications" wide>
                  <div className="flex items-center justify-between border-b border-black/[0.055] px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-[#2a2a2f]">
                        Notifications
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#9999a1]">
                        {notifications.length
                          ? `${notifications.length} items need a look`
                          : "You’re all caught up"}
                      </p>
                    </div>
                    {notifications.length ? (
                      <button
                        type="button"
                        onClick={() => setNotifications([])}
                        className="text-[11px] font-semibold text-[#6d5dfc] hover:text-[#5144d9]"
                      >
                        Clear all
                      </button>
                    ) : null}
                  </div>

                  <div className="p-1.5">
                    {notifications.length ? (
                      notifications.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="flex gap-3 rounded-[13px] p-3 transition hover:bg-black/[0.04]"
                        >
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6d5dfc]" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-semibold text-[#2c2c31]">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-[#8d8d96]">
                              {item.detail}
                            </span>
                          </span>
                          <span className="text-[10px] font-medium text-[#aaaab1]">
                            {item.time}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-5 py-9 text-center">
                        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check size={18} />
                        </span>
                        <p className="mt-3 text-sm font-semibold text-[#34343a]">
                          Nothing waiting
                        </p>
                      </div>
                    )}
                  </div>
                </PopoverCard>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <MobileDock pathname={pathname} onMenu={() => setMobileOpen(true)} />

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-[#f6f6f8] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div className="flex h-full flex-col">
            <div className="flex h-[72px] items-center justify-between border-b border-black/[0.06] px-5">
              <Link href="/dashboard" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#17171b] text-xs font-bold text-white">
                  DO
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#1e1e22]">
                    DevonOS
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b9ba3]">
                    Command Center
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="devon-icon-button"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="devon-scrollbar flex-1 overflow-y-auto p-4">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9e9ea6]">
                All workspaces
              </p>
              <nav className="grid grid-cols-2 gap-2" aria-label="All workspaces">
                {allNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-[17px] border p-4 transition ${
                        active
                          ? "border-[#17171b] bg-[#17171b] text-white"
                          : "border-black/[0.06] bg-white text-[#303036]"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="mt-5 block text-sm font-semibold">
                        {item.name}
                      </span>
                      <span
                        className={`mt-1 line-clamp-1 block text-[11px] ${
                          active ? "text-white/55" : "text-[#9999a1]"
                        }`}
                      >
                        {item.description}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      ) : null}

      {paletteOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/25 px-4 pt-[8vh] backdrop-blur-sm sm:pt-[14vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setPaletteOpen(false);
          }}
        >
          <div className="w-full max-w-[620px] overflow-hidden rounded-[24px] border border-white/60 bg-[#fbfbfc] shadow-[0_32px_100px_rgba(0,0,0,0.24)]">
            <div className="flex items-center gap-3 border-b border-black/[0.06] px-4">
              <Search size={18} className="text-[#84848d]" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredItems[0]) {
                    navigateTo(filteredItems[0].href);
                  }
                }}
                placeholder="Search workspaces and actions..."
                className="h-14 flex-1 bg-transparent text-[15px] text-[#25252a] outline-none placeholder:text-[#a5a5ac]"
                aria-label="Search workspaces"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="rounded-lg border border-black/[0.07] bg-white px-2 py-1 text-[10px] font-semibold text-[#8f8f97]"
              >
                ESC
              </button>
            </div>

            <div className="devon-scrollbar max-h-[430px] overflow-y-auto p-2">
              {filteredItems.length ? (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => navigateTo(item.href)}
                      className={`group flex w-full items-center gap-3 rounded-[15px] p-3 text-left transition hover:bg-black/[0.045] ${
                        index === 0 && query ? "bg-black/[0.035]" : ""
                      }`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-black/[0.055] bg-white text-[#6d5dfc] shadow-sm">
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#303036]">
                          {item.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-[#95959d]">
                          {item.description}
                        </span>
                      </span>
                      <ChevronRight
                        size={15}
                        className="text-[#b9b9c0] transition group-hover:translate-x-0.5 group-hover:text-[#6d5dfc]"
                      />
                    </button>
                  );
                })
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm font-semibold text-[#404046]">
                    No matching workspace
                  </p>
                  <p className="mt-1 text-xs text-[#9999a1]">
                    Try a module name or action.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-black/[0.055] px-4 py-2.5 text-[10px] font-medium text-[#a0a0a8]">
              <span>Press Enter to open the first result</span>
              <Link
                href="/command"
                onClick={() => setPaletteOpen(false)}
                className="font-semibold text-[#6d5dfc]"
              >
                Command center
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {createOpen || notificationsOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 cursor-default"
          aria-label="Close popover"
          onClick={() => {
            setCreateOpen(false);
            setNotificationsOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function PopoverCard({
  children,
  label,
  wide = false,
}: {
  children: React.ReactNode;
  label: string;
  wide?: boolean;
}) {
  return (
    <div
      role="menu"
      aria-label={label}
      className={`absolute right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[19px] border border-black/[0.07] bg-white/96 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-2xl ${
        wide ? "w-[340px]" : "w-[260px]"
      }`}
    >
      {children}
    </div>
  );
}

function MobileDock({
  pathname,
  onMenu,
}: {
  pathname: string;
  onMenu: () => void;
}) {
  const dockItems = [
    { name: "Home", href: "/dashboard", icon: Gauge },
    { name: "Projects", href: "/projects", icon: Briefcase },
    { name: "Create", href: "/command", icon: Plus },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
  ];

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 grid h-[64px] grid-cols-5 items-center rounded-[22px] border border-white/70 bg-[#17171b]/94 px-2 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:hidden"
      aria-label="Quick navigation"
    >
      {dockItems.slice(0, 2).map((item) => (
        <DockLink key={item.href} item={item} pathname={pathname} />
      ))}

      <DockLink item={dockItems[2]} pathname={pathname} primary />

      <DockLink item={dockItems[3]} pathname={pathname} />

      <button
        type="button"
        onClick={onMenu}
        className="flex h-12 flex-col items-center justify-center gap-1 rounded-2xl text-white/55 transition hover:text-white"
      >
        <Menu size={18} />
        <span className="text-[9px] font-semibold">More</span>
      </button>
    </nav>
  );
}

function DockLink({
  item,
  pathname,
  primary = false,
}: {
  item: { name: string; href: string; icon: ElementType };
  pathname: string;
  primary?: boolean;
}) {
  const active = isItemActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex h-12 flex-col items-center justify-center gap-1 rounded-2xl transition ${
        primary
          ? "mx-auto -mt-7 h-12 w-12 bg-white text-[#17171b] shadow-[0_8px_25px_rgba(0,0,0,0.25)]"
          : active
            ? "bg-white/10 text-white"
            : "text-white/55 hover:text-white"
      }`}
    >
      <Icon size={primary ? 20 : 18} />
      {!primary ? (
        <span className="text-[9px] font-semibold">{item.name}</span>
      ) : null}
    </Link>
  );
}
