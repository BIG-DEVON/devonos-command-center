import { createNewsDigest, runNewsMonitor } from "@/lib/news-intelligence";
import { createNotification } from "@/lib/notifications";
import { scanOperationalAlerts } from "@/lib/operational-alerts";
import { prisma } from "@/lib/prisma";

export const DAILY_INTELLIGENCE_KEY = "daily-intelligence";

function validTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function dateTimeParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function wallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
) {
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = new Date(wallClock);

  for (let pass = 0; pass < 2; pass += 1) {
    const shown = dateTimeParts(candidate, timeZone);
    const shownAsUtc = Date.UTC(
      shown.year,
      shown.month - 1,
      shown.day,
      shown.hour,
      shown.minute,
      shown.second
    );
    candidate = new Date(candidate.getTime() + (wallClock - shownAsUtc));
  }

  return candidate;
}

export function nextAutomationRun(
  time: string,
  timeZone: string,
  now = new Date()
) {
  const [targetHour, targetMinute] = (validTime(time) ? time : "07:30")
    .split(":")
    .map(Number);
  const current = dateTimeParts(now, timeZone);
  const hasPassed =
    current.hour > targetHour ||
    (current.hour === targetHour && current.minute >= targetMinute);
  const localNoon = new Date(
    Date.UTC(current.year, current.month - 1, current.day + (hasPassed ? 1 : 0), 12)
  );
  const targetDate = dateTimeParts(localNoon, timeZone);

  return wallTimeToUtc(
    targetDate.year,
    targetDate.month,
    targetDate.day,
    targetHour,
    targetMinute,
    timeZone
  );
}

export async function ensureDefaultAutomationSchedule() {
  const existing = await prisma.automationSchedule.findUnique({
    where: {
      key: DAILY_INTELLIGENCE_KEY,
    },
  });

  if (existing) {
    return prisma.automationSchedule.update({
      where: {
        id: existing.id,
      },
      data: {
        name: "Daily command sweep",
        description:
          "Check deadlines, projects, birthdays, approvals, scheduled content, news, official sources, and connected social channels.",
      },
    });
  }

  const settings = await prisma.workspaceSettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  return prisma.automationSchedule.create({
    data: {
      key: DAILY_INTELLIGENCE_KEY,
      name: "Daily command sweep",
      description:
        "Check deadlines, projects, birthdays, approvals, scheduled content, news, official sources, and connected social channels.",
      enabled: true,
      cadence: "Daily",
      time:
        settings?.dailyBriefTime && validTime(settings.dailyBriefTime)
          ? settings.dailyBriefTime
          : "07:30",
      timezone: settings?.timezone || "Africa/Lagos",
      channels: JSON.stringify(["in-app"]),
    },
  });
}

export async function getAutomationControlCenter() {
  const schedule = await ensureDefaultAutomationSchedule();
  const runs = await prisma.automationRun.findMany({
    where: {
      scheduleKey: schedule.key,
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 8,
  });

  return {
    schedule,
    runs,
    nextRunAt: schedule.enabled
      ? nextAutomationRun(schedule.time, schedule.timezone).toISOString()
      : null,
  };
}

export async function updateDailyIntelligenceSchedule(input: {
  enabled?: boolean;
  time?: string;
}) {
  const schedule = await ensureDefaultAutomationSchedule();

  const updated = await prisma.automationSchedule.update({
    where: {
      id: schedule.id,
    },
    data: {
      enabled:
        typeof input.enabled === "boolean" ? input.enabled : schedule.enabled,
      time:
        typeof input.time === "string" && validTime(input.time)
          ? input.time
          : schedule.time,
    },
  });

  if (typeof input.time === "string" && validTime(input.time)) {
    await prisma.workspaceSettings.updateMany({
      data: {
        dailyBriefTime: input.time,
      },
    });
  }

  return updated;
}

export async function runDailyIntelligenceAutomation(
  trigger: "Manual" | "Scheduled" = "Manual"
) {
  const schedule = await ensureDefaultAutomationSchedule();
  const automationRun = await prisma.automationRun.create({
    data: {
      scheduleKey: schedule.key,
      trigger,
      status: "Running",
    },
  });

  try {
    const operationalResult = await scanOperationalAlerts();
    const monitorResult = await runNewsMonitor();
    const digestResult = await createNewsDigest({
      mode: "daily",
      reuseForDate: true,
    });
    const monitorRun = monitorResult.run;
    const newsSummary = digestResult.itemCount
      ? `${digestResult.itemCount} relevant mention${
          digestResult.itemCount === 1 ? "" : "s"
        } ready. ${monitorRun.articlesCreated} new record${
          monitorRun.articlesCreated === 1 ? "" : "s"
        } added from ${monitorRun.sourcesSucceeded}/${monitorRun.sourcesChecked} available sources.`
      : `No relevant mentions found today. ${monitorRun.sourcesSucceeded}/${monitorRun.sourcesChecked} available sources were checked.`;
    const operationalSummary = operationalResult.counts.active
      ? `${operationalResult.counts.active} operational alert${
          operationalResult.counts.active === 1 ? "" : "s"
        } active, including ${operationalResult.counts.critical} critical and ${operationalResult.counts.warning} warning.`
      : "No operational alerts need attention.";
    const summary = `${operationalSummary} ${newsSummary}`;
    const completedAt = new Date();
    const completedRun = await prisma.automationRun.update({
      where: {
        id: automationRun.id,
      },
      data: {
        status:
          monitorRun.status === "Failed"
            ? "Failed"
            : monitorRun.status === "Completed with warnings"
              ? "Completed with warnings"
              : "Completed",
        summary,
        outputHref: "/autopilot",
        recordsCreated:
          monitorRun.articlesCreated + operationalResult.counts.created,
        completedAt,
      },
    });

    await prisma.automationSchedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        lastRunAt: completedAt,
        lastStatus: completedRun.status,
        lastSummary: summary,
      },
    });

    await createNotification({
      title: digestResult.itemCount
        ? "Daily intelligence is ready"
        : "No relevant mentions today",
      message: summary,
      category: "News",
      severity: digestResult.itemCount ? "success" : "info",
      href: "/news",
      sourceType: "AutomationRun",
      sourceId: completedRun.id,
      dedupeKey: `${DAILY_INTELLIGENCE_KEY}:${digestResult.date}`,
    });

    return {
      schedule,
      run: completedRun,
      digest: digestResult.digest,
      itemCount: digestResult.itemCount,
      monitorRun,
      operationalResult,
      summary,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown automation error.";
    const completedAt = new Date();

    await prisma.automationRun.update({
      where: {
        id: automationRun.id,
      },
      data: {
        status: "Failed",
        summary: "The daily command sweep did not complete.",
        error: message,
        completedAt,
      },
    });
    await prisma.automationSchedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        lastRunAt: completedAt,
        lastStatus: "Failed",
        lastSummary: "The daily command sweep did not complete.",
      },
    });
    await createNotification({
      title: "Daily command sweep needs attention",
      message:
        "The command sweep did not complete. Open Autopilot to review the run and try again.",
      category: "News",
      severity: "critical",
      href: "/autopilot",
      sourceType: "AutomationRun",
      sourceId: automationRun.id,
      dedupeKey: `${DAILY_INTELLIGENCE_KEY}:error:${completedAt
        .toISOString()
        .slice(0, 10)}`,
    });

    throw error;
  }
}
