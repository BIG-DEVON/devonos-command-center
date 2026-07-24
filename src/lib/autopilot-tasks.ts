import { prisma } from "@/lib/prisma";
import { localDateKey } from "@/lib/date";

export type SignalSeverity = "critical" | "high" | "medium" | "low";

export type CommandSignal = {
  id: string;
  module: string;
  title: string;
  detail: string;
  severity: SignalSeverity;
  href: string;
  action: string;
  sortScore: number;
};

export type AutopilotBriefResponse = {
  ok: boolean;
  generatedAt: string;
  health: "critical" | "attention" | "stable";
  counts: {
    kpis: number;
    projects: number;
    socialDrafts: number;
    assets: number;
    events: number;
    birthdays: number;
    aiDrafts: number;
    newsItems: number;
    signals: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  signals: CommandSignal[];
  topSignals: CommandSignal[];
  briefText: string;
  message?: string;
};

function stableSignalKey(signal: CommandSignal) {
  return `${signal.module}-${signal.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function dueDateForSeverity(severity: SignalSeverity) {
  if (severity === "critical") return dateOffset(0);
  if (severity === "high") return dateOffset(1);
  if (severity === "medium") return dateOffset(3);
  return dateOffset(7);
}

export async function getAutopilotBrief(request: Request) {
  const briefUrl = new URL("/api/autopilot/brief", request.url);

  const response = await fetch(briefUrl, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not fetch Autopilot brief.");
  }

  const data = (await response.json()) as AutopilotBriefResponse;

  if (!data.ok) {
    throw new Error(data.message || "Autopilot brief was invalid.");
  }

  return data;
}

export async function ensureAutopilotTasks(brief: AutopilotBriefResponse) {
  const signals = brief.signals.slice(0, 20);

  let created = 0;
  let skipped = 0;

  for (const signal of signals) {
    const sourceSignalId = stableSignalKey(signal);

    const existingTask = await prisma.autopilotTask.findFirst({
      where: {
        sourceSignalId,
      },
    });

    if (existingTask) {
      skipped += 1;
      continue;
    }

    await prisma.autopilotTask.create({
      data: {
        title: signal.title,
        module: signal.module,
        severity: signal.severity,
        status: "Open",
        dueDate: dueDateForSeverity(signal.severity),
        detail: signal.detail,
        action: signal.action,
        href: signal.href,
        sourceSignalId,
      },
    });

    created += 1;
  }

  return {
    created,
    skipped,
  };
}
