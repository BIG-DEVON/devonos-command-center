import {
  BarChart3,
  Bot,
  CalendarDays,
  Cake,
  Command,
  FolderKanban,
  Gauge,
  Globe2,
  Newspaper,
  Search,
  Settings,
  Share2,
  Target,
  UploadCloud,
} from "lucide-react";

export const mainNavigation = [
  {
    title: "Command",
    href: "/dashboard",
    icon: Gauge,
  },
  {
    title: "News Intel",
    href: "/news",
    icon: Newspaper,
  },
  {
    title: "Social Studio",
    href: "/social",
    icon: Share2,
  },
  {
    title: "Birthdays",
    href: "/birthdays",
    icon: Cake,
  },
  {
    title: "KPI Command",
    href: "/kpi",
    icon: Target,
  },
  {
    title: "Global Events",
    href: "/events",
    icon: Globe2,
  },
  {
    title: "Assets",
    href: "/assets",
    icon: UploadCloud,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "AI Studio",
    href: "/ai",
    icon: Bot,
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
  },
];

export const utilityNavigation = [
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Command Menu",
    href: "/command",
    icon: Command,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];