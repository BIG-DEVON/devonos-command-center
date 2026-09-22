"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  Command,
  FileCheck2,
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
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { mainNavigation, utilityNavigation } from "@/config/navigation";
import { useDevonPreferences } from "@/components/providers/devon-preferences-provider";
import { UniversalSearchPalette } from "@/components/search/universal-search-palette";

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
    label: "Approval request",
    description: "Route a decision",
    href: "/approvals",
    icon: FileCheck2,
  },
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

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  severity: string;
  href: string;
  status: "Unread" | "Read" | "Archived";
  createdAt: string;
};

const NOTIFICATIONS_CHANGED_EVENT = "devonos:notifications-changed";

function notificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function notificationDotClass(severity: string) {
  if (severity === "critical") return "bg-red-500";
  if (severity === "warning") return "bg-amber-500";
  if (severity === "success") return "bg-cyan-500";
  return "bg-[#6d5dfc]";
}

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopCommandBar() {
  const pathname = usePathname();
  const { settings, playSound } = useDevonPreferences();
  const notificationFetchCompleted = useRef(false);
  const previousUnreadCount = useRef(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeItem =
    allNavigation
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isItemActive(pathname, item.href)) ?? allNavigation[0];
  const highestUnreadSeverity =
    notifications.find(
      (notification) =>
        notification.status === "Unread" &&
        notification.severity === "critical"
    )?.severity ??
    notifications.find(
      (notification) =>
        notification.status === "Unread" &&
        notification.severity === "warning"
    )?.severity ??
    "info";

  const loadNotifications = useCallback(
    async (announceNew = false) => {
      try {
        setNotificationsLoading(true);
        const response = await fetch("/api/notifications", {
          method: "GET",
          cache: "no-store",
        });
        const data = (await response.json()) as {
          ok: boolean;
          notifications?: NotificationItem[];
          unreadCount?: number;
        };

        if (!response.ok || !data.ok) return;

        const nextUnreadCount = data.unreadCount ?? 0;
        if (
          announceNew &&
          notificationFetchCompleted.current &&
          nextUnreadCount > previousUnreadCount.current
        ) {
          playSound();
        }

        setNotifications(data.notifications ?? []);
        setUnreadCount(nextUnreadCount);
        previousUnreadCount.current = nextUnreadCount;
        notificationFetchCompleted.current = true;
      } catch (error) {
        console.error("Failed to refresh notifications:", error);
      } finally {
        setNotificationsLoading(false);
      }
    },
    [playSound]
  );

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
    if (!settings.inAppNotifications) {
      setNotificationsOpen(false);
      return;
    }

    void loadNotifications(false);

    function handleNotificationsChanged() {
      void loadNotifications(true);
    }

    window.addEventListener(
      NOTIFICATIONS_CHANGED_EVENT,
      handleNotificationsChanged
    );
    const refreshInterval = window.setInterval(
      () => void loadNotifications(true),
      60_000
    );

    return () => {
      window.removeEventListener(
        NOTIFICATIONS_CHANGED_EVENT,
        handleNotificationsChanged
      );
      window.clearInterval(refreshInterval);
    };
  }, [loadNotifications, settings.inAppNotifications]);

  async function markNotification(
    id: string,
    status: "Read" | "Archived"
  ) {
    const item = notifications.find((notification) => notification.id === id);
    if (!item || item.status === status) return;

    setNotifications((current) =>
      status === "Archived"
        ? current.filter((notification) => notification.id !== id)
        : current.map((notification) =>
            notification.id === id
              ? { ...notification, status: "Read" }
              : notification
          )
    );
    if (item.status === "Unread") {
      setUnreadCount((count) => Math.max(0, count - 1));
      previousUnreadCount.current = Math.max(
        0,
        previousUnreadCount.current - 1
      );
    }

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
    } catch (error) {
      console.error("Failed to update notification:", error);
      void loadNotifications(false);
    }
  }

  async function markAllNotificationsRead() {
    if (!unreadCount) return;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        status: "Read",
      }))
    );
    setUnreadCount(0);
    previousUnreadCount.current = 0;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!response.ok) void loadNotifications(false);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      void loadNotifications(false);
    }
  }

  function openPalette() {
    setPaletteOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/[0.055] bg-[#f5f5f7]/88 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4">
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
              aria-label="Morrow dashboard"
            >
              M
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[17px] font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-[19px]">
                  {activeItem.name}
                </h1>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openPalette}
            className="group hidden h-10 w-full max-w-[430px] items-center gap-3 rounded-[12px] border border-black/[0.065] bg-white/82 px-3 text-left text-[13px] text-[#8e8e93] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:border-black/[0.11] hover:bg-white md:flex"
          >
            <Search size={15} />
            <span className="flex-1">Search people, work, or anything</span>
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

            {settings.inAppNotifications ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                  setNotificationsOpen((open) => {
                      return !open;
                    });
                    setCreateOpen(false);
                  }}
                  className="devon-icon-button relative"
                  aria-label={`${unreadCount} unread notifications`}
                  aria-expanded={notificationsOpen}
                >
                  <Bell size={17} />
                  {unreadCount ? (
                    <span
                      className={`absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full ring-2 ring-white ${notificationDotClass(
                        highestUnreadSeverity
                      )}`}
                    />
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
                        {unreadCount
                          ? `${unreadCount} unread ${
                              unreadCount === 1 ? "update" : "updates"
                            }`
                          : "You’re all caught up"}
                      </p>
                    </div>
                    {unreadCount ? (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-semibold text-[#6d5dfc] hover:text-[#5144d9]"
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>

                  <div className="p-1.5">
                    {notifications.length ? (
                      notifications.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href || "/autopilot"}
                          onClick={() => void markNotification(item.id, "Read")}
                          className={`flex gap-3 rounded-[13px] p-3 transition hover:bg-black/[0.04] ${
                            item.status === "Unread" ? "bg-[#f6f5ff]" : ""
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              item.status === "Unread"
                                ? notificationDotClass(item.severity)
                                : "bg-[#d5d5da]"
                            }`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-[#9a90ef]">
                              {item.category}
                            </span>
                            <span className="block text-[13px] font-semibold text-[#2c2c31]">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-[#8d8d96]">
                              {item.message}
                            </span>
                          </span>
                          <span className="text-[10px] font-medium text-[#aaaab1]">
                            {notificationTime(item.createdAt)}
                          </span>
                        </Link>
                      ))
                    ) : notificationsLoading ? (
                      <div className="px-5 py-9 text-center">
                        <p className="text-sm font-semibold text-[#696971]">
                          Loading notifications…
                        </p>
                      </div>
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
            ) : null}
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
            <div className="flex h-16 items-center justify-between border-b border-black/[0.06] px-5">
              <Link href="/dashboard" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#17171b] text-xs font-bold text-white">
                  M
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#1e1e22]">
                    Morrow
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
        <UniversalSearchPalette onClose={() => setPaletteOpen(false)} />
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
