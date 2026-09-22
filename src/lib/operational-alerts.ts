import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export type OperationalAlert = {
  key: string;
  title: string;
  message: string;
  category: "Deadline" | "Project" | "Birthday" | "Approval" | "Content";
  severity: "info" | "success" | "warning" | "critical";
  href: string;
  sourceType: string;
  sourceId: string;
};

function dateKeyInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(date);
}

function validDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function daysBetweenDateKeys(from: string, to: string) {
  if (!validDateKey(from) || !validDateKey(to)) return 999_999;
  const fromTime = Date.parse(`${from}T12:00:00Z`);
  const toTime = Date.parse(`${to}T12:00:00Z`);
  if (!Number.isFinite(fromTime) || !Number.isFinite(toTime)) return 999_999;
  return Math.round((toTime - fromTime) / 86_400_000);
}

function formatDate(value: string) {
  if (!validDateKey(value)) return "an unsupplied date";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function nextBirthdayDateKey(today: string, month: number, day: number) {
  const year = Number(today.slice(0, 4));
  const monthPart = String(Math.min(12, Math.max(1, month))).padStart(2, "0");
  const dayPart = String(Math.min(31, Math.max(1, day))).padStart(2, "0");
  const currentYear = `${year}-${monthPart}-${dayPart}`;

  return currentYear >= today
    ? currentYear
    : `${year + 1}-${monthPart}-${dayPart}`;
}

function alertKey(
  sourceType: string,
  sourceId: string,
  kind: string,
  state: string
) {
  return `operational-alert:${sourceType}:${sourceId}:${kind}:${state}`;
}

function prioritySeverity(priority: string, fallback: "warning" | "critical") {
  return priority === "Critical" ? "critical" : fallback;
}

function reminderStage(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "one-day";
  if (days <= 3) return "three-day";
  if (days <= 7) return "seven-day";
  if (days <= 14) return "fourteen-day";
  return null;
}

function relativeDayLabel(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export async function collectOperationalAlerts() {
  const settings = await prisma.workspaceSettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });
  const timeZone = settings?.timezone || "Africa/Lagos";
  const today = dateKeyInTimeZone(new Date(), timeZone);
  const [
    kpis,
    projects,
    socialDrafts,
    events,
    birthdays,
    aiDrafts,
    approvals,
  ] =
    await Promise.all([
      prisma.kpiItem.findMany(),
      prisma.projectRecord.findMany(),
      prisma.socialDraft.findMany(),
      prisma.globalEvent.findMany(),
      prisma.birthdayProfile.findMany(),
      prisma.aiDraft.findMany(),
      prisma.approvalRequest.findMany(),
    ]);
  const alerts: OperationalAlert[] = [];

  for (const kpi of kpis) {
    if (kpi.status === "Completed") continue;
    const days = daysBetweenDateKeys(today, kpi.dueDate);

    if (kpi.status === "Blocked" || kpi.status === "Delayed") {
      alerts.push({
        key: alertKey("KpiItem", kpi.id, "blocked", kpi.status),
        title: `KPI needs attention: ${kpi.title}`,
        message: `${kpi.title} is marked ${kpi.status}. Add the blocker, owner, and next recovery action.`,
        category: "Deadline",
        severity: kpi.status === "Blocked" ? "critical" : "warning",
        href: "/kpi",
        sourceType: "KpiItem",
        sourceId: kpi.id,
      });
    } else if (days < 0) {
      alerts.push({
        key: alertKey("KpiItem", kpi.id, "overdue", kpi.dueDate),
        title: `Overdue KPI: ${kpi.title}`,
        message: `${kpi.title} was due ${formatDate(kpi.dueDate)} and is still ${kpi.status}.`,
        category: "Deadline",
        severity: prioritySeverity(kpi.priority, "warning"),
        href: "/kpi",
        sourceType: "KpiItem",
        sourceId: kpi.id,
      });
    } else if (days <= 7) {
      const stage = reminderStage(days);
      alerts.push({
        key: alertKey("KpiItem", kpi.id, "due-soon", `${kpi.dueDate}:${stage}`),
        title: days === 0 ? `KPI due today: ${kpi.title}` : `KPI due soon: ${kpi.title}`,
        message: `${kpi.title} is due ${relativeDayLabel(days)} on ${formatDate(kpi.dueDate)}. Confirm the remaining work and owner.`,
        category: "Deadline",
        severity: prioritySeverity(kpi.priority, "warning"),
        href: "/kpi",
        sourceType: "KpiItem",
        sourceId: kpi.id,
      });
    }
  }

  for (const project of projects) {
    if (project.status === "Completed" || project.status === "Archived") {
      continue;
    }
    const days = daysBetweenDateKeys(today, project.dueDate);

    if (project.status === "Paused") {
      alerts.push({
        key: alertKey("ProjectRecord", project.id, "paused", project.status),
        title: `Paused project: ${project.name}`,
        message: `${project.name} is paused. Decide whether to resume, redefine, or archive it.`,
        category: "Project",
        severity: "warning",
        href: "/projects",
        sourceType: "ProjectRecord",
        sourceId: project.id,
      });
    } else if (days < 0) {
      alerts.push({
        key: alertKey("ProjectRecord", project.id, "overdue", project.dueDate),
        title: `Overdue project: ${project.name}`,
        message: `${project.name} was due ${formatDate(project.dueDate)} and is still ${project.status}.`,
        category: "Project",
        severity: prioritySeverity(project.priority, "warning"),
        href: "/projects",
        sourceType: "ProjectRecord",
        sourceId: project.id,
      });
    } else if (days <= 14) {
      const stage = reminderStage(days);
      alerts.push({
        key: alertKey(
          "ProjectRecord",
          project.id,
          "due-soon",
          `${project.dueDate}:${stage}`
        ),
        title: `Project deadline approaching: ${project.name}`,
        message: `${project.name} is due ${relativeDayLabel(days)} on ${formatDate(project.dueDate)}. Review deliverables and the next decision.`,
        category: "Project",
        severity: prioritySeverity(project.priority, "warning"),
        href: "/projects",
        sourceType: "ProjectRecord",
        sourceId: project.id,
      });
    }
  }

  for (const draft of socialDrafts) {
    if (draft.status === "Posted" || draft.status === "Archived") continue;
    const days = daysBetweenDateKeys(today, draft.scheduledDate);

    if (validDateKey(draft.scheduledDate) && days < 0) {
      alerts.push({
        key: alertKey(
          "SocialDraft",
          draft.id,
          "missed-schedule",
          draft.scheduledDate
        ),
        title: `Scheduled post missed: ${draft.title}`,
        message: `${draft.title} was scheduled for ${formatDate(draft.scheduledDate)} but is still ${draft.status}. Reschedule, post, or archive it.`,
        category: "Content",
        severity: "critical",
        href: "/social",
        sourceType: "SocialDraft",
        sourceId: draft.id,
      });
    } else if (validDateKey(draft.scheduledDate) && days <= 3) {
      const stage = reminderStage(days);
      alerts.push({
        key: alertKey(
          "SocialDraft",
          draft.id,
          "scheduled-soon",
          `${draft.scheduledDate}:${stage}`
        ),
        title: `Scheduled post approaching: ${draft.title}`,
        message: `${draft.title} is scheduled ${relativeDayLabel(days)} for ${formatDate(draft.scheduledDate)}. Confirm caption, visual, and approval.`,
        category: "Content",
        severity: "warning",
        href: "/social",
        sourceType: "SocialDraft",
        sourceId: draft.id,
      });
    } else if (draft.status === "Review" || draft.status === "Approved") {
      alerts.push({
        key: alertKey("SocialDraft", draft.id, "approval", draft.status),
        title: `Social draft ready: ${draft.title}`,
        message: `${draft.title} is ${draft.status} for ${draft.platform}. Decide whether to revise, schedule, or post it.`,
        category: "Approval",
        severity: draft.status === "Review" ? "warning" : "info",
        href: "/social",
        sourceType: "SocialDraft",
        sourceId: draft.id,
      });
    }
  }

  for (const event of events) {
    if (event.status === "Posted" || event.status === "Archived") continue;
    const days = daysBetweenDateKeys(today, event.date);
    if (days < 0 || days > 14) continue;
    const stage = reminderStage(days);

    alerts.push({
      key: alertKey("GlobalEvent", event.id, "upcoming", `${event.date}:${stage}`),
      title: days === 0 ? `Event today: ${event.title}` : `Upcoming event: ${event.title}`,
      message: `${event.title} is ${relativeDayLabel(days)} on ${formatDate(event.date)}. Prepare the caption, visual, and approval path.`,
      category: "Content",
      severity: event.relevance === "High" || days <= 7 ? "warning" : "info",
      href: "/events",
      sourceType: "GlobalEvent",
      sourceId: event.id,
    });
  }

  for (const birthday of birthdays) {
    const birthdayDate = nextBirthdayDateKey(
      today,
      birthday.month,
      birthday.day
    );
    const days = daysBetweenDateKeys(today, birthdayDate);
    if (days < 0 || days > 14) continue;
    const stage = reminderStage(days);

    alerts.push({
      key: alertKey(
        "BirthdayProfile",
        birthday.id,
        "birthday",
        `${birthdayDate}:${stage}`
      ),
      title:
        days === 0
          ? `Birthday today: ${birthday.name}`
          : `Birthday coming up: ${birthday.name}`,
      message:
        days === 0
          ? `It is ${birthday.name}'s birthday today. Prepare the message or design before the day gets busy.`
          : `${birthday.name}'s birthday is ${relativeDayLabel(days)}, ${formatDate(birthdayDate)}. Prepare the message and final visual in advance.`,
      category: "Birthday",
      severity: days <= 7 ? "warning" : "info",
      href: "/birthdays",
      sourceType: "BirthdayProfile",
      sourceId: birthday.id,
    });
  }

  const generatedDrafts = aiDrafts.filter(
    (draft) => draft.status === "Generated"
  );
  if (generatedDrafts.length) {
    alerts.push({
      key: alertKey(
        "AiDraft",
        "generated-review",
        "approval",
        String(generatedDrafts.length)
      ),
      title: `${generatedDrafts.length} generated draft${generatedDrafts.length === 1 ? "" : "s"} need review`,
      message:
        "Generated drafts should be reviewed and marked Reviewed, Used, or Archived before they become stale.",
      category: "Approval",
      severity: "info",
      href: "/ai",
      sourceType: "AiDraft",
      sourceId: "generated-review",
    });
  }

  for (const approval of approvals) {
    if (
      approval.status !== "Pending" &&
      approval.status !== "Changes Requested"
    ) {
      continue;
    }

    const days = daysBetweenDateKeys(today, approval.dueDate);

    if (validDateKey(approval.dueDate) && days < 0) {
      alerts.push({
        key: alertKey(
          "ApprovalRequest",
          approval.id,
          "overdue",
          approval.dueDate
        ),
        title: `Approval overdue: ${approval.title}`,
        message: `${approval.title} was due ${formatDate(approval.dueDate)}. Review the source and record the decision.`,
        category: "Approval",
        severity: prioritySeverity(approval.priority, "warning"),
        href: "/approvals",
        sourceType: "ApprovalRequest",
        sourceId: approval.id,
      });
    } else if (validDateKey(approval.dueDate) && days <= 3) {
      const stage = reminderStage(days);
      alerts.push({
        key: alertKey(
          "ApprovalRequest",
          approval.id,
          "due-soon",
          `${approval.dueDate}:${stage}`
        ),
        title:
          days === 0
            ? `Approval due today: ${approval.title}`
            : `Approval due soon: ${approval.title}`,
        message: `${approval.title} is assigned to ${approval.approver} and due ${relativeDayLabel(days)} on ${formatDate(approval.dueDate)}.`,
        category: "Approval",
        severity: prioritySeverity(approval.priority, "warning"),
        href: "/approvals",
        sourceType: "ApprovalRequest",
        sourceId: approval.id,
      });
    }
  }

  return {
    alerts,
    today,
    timeZone,
  };
}

export async function scanOperationalAlerts() {
  const { alerts, today, timeZone } = await collectOperationalAlerts();
  const currentKeys = new Set(alerts.map((alert) => alert.key));
  const existing = await prisma.notificationRecord.findMany({
    where: {
      dedupeKey: {
        startsWith: "operational-alert:",
      },
    },
  });
  const existingByKey = new Map(
    existing
      .filter(
        (notification) =>
          typeof notification.dedupeKey === "string" &&
          Boolean(notification.dedupeKey)
      )
      .map((notification) => [notification.dedupeKey as string, notification])
  );
  let created = 0;
  let refreshed = 0;
  let archived = 0;

  for (const alert of alerts) {
    const existingNotification = existingByKey.get(alert.key);
    if (!existingNotification || existingNotification.status === "Archived") {
      created += 1;
    } else {
      refreshed += 1;
    }

    await createNotification({
      title: alert.title,
      message: alert.message,
      category: alert.category,
      severity: alert.severity,
      href: alert.href,
      sourceType: alert.sourceType,
      sourceId: alert.sourceId,
      dedupeKey: alert.key,
      reopenOnUpdate: existingNotification?.status === "Archived",
    });
  }

  for (const notification of existing) {
    if (
      notification.dedupeKey &&
      !currentKeys.has(notification.dedupeKey) &&
      notification.status !== "Archived"
    ) {
      await prisma.notificationRecord.update({
        where: {
          id: notification.id,
        },
        data: {
          status: "Archived",
        },
      });
      archived += 1;
    }
  }

  const categories = alerts.reduce<Record<string, number>>((counts, alert) => {
    counts[alert.category] = (counts[alert.category] ?? 0) + 1;
    return counts;
  }, {});
  const critical = alerts.filter(
    (alert) => alert.severity === "critical"
  ).length;
  const warning = alerts.filter(
    (alert) => alert.severity === "warning"
  ).length;

  return {
    alerts,
    counts: {
      active: alerts.length,
      created,
      refreshed,
      archived,
      critical,
      warning,
      categories,
    },
    today,
    timeZone,
  };
}
