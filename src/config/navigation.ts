import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  Briefcase,
  Cake,
  CalendarDays,
  FileCheck2,
  Gauge,
  Globe2,
  Newspaper,
  Rocket,
  Settings,
  Share2,
  Target,
  UploadCloud,
} from "lucide-react";

export type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const mainNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Gauge,
    description: "Workspace overview",
  },
  {
    name: "Autopilot",
    href: "/autopilot",
    icon: Rocket,
    description: "Daily assistant actions",
  },
  {
    name: "Approvals",
    href: "/approvals",
    icon: FileCheck2,
    description: "Decisions and audit trail",
  },
  {
    name: "News Intel",
    href: "/news",
    icon: Newspaper,
    description: "Monitor news signals",
  },
  {
    name: "Social Studio",
    href: "/social",
    icon: Share2,
    description: "Create and review posts",
  },
  {
    name: "Birthdays",
    href: "/birthdays",
    icon: Cake,
    description: "Culture moments",
  },
  {
    name: "KPI Tracking",
    href: "/kpi",
    icon: Target,
    description: "Track outcomes",
  },
  {
    name: "Events",
    href: "/events",
    icon: Globe2,
    description: "Plan notable days",
  },
  {
    name: "Assets",
    href: "/assets",
    icon: UploadCloud,
    description: "Organize files",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Workspace summaries",
  },
  {
    name: "Writing Studio",
    href: "/ai",
    icon: Bot,
    description: "Draft and refine content",
  },
];

export const utilityNavigation: NavigationItem[] = [
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    description: "Upcoming dates",
  },
  {
    name: "Projects",
    href: "/projects",
    icon: Briefcase,
    description: "Workstreams",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System rules",
  },
];
