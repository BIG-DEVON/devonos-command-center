import "server-only";

import { prisma } from "@/lib/prisma";

export const reportRanges = ["7d", "30d", "90d", "all"] as const;
export type ReportRange = (typeof reportRanges)[number];

export type ReportDimension = {
  key: "execution" | "readiness" | "governance" | "foresight";
  label: string;
  score: number;
  note: string;
};

export type ReportEvidence = {
  id: string;
  module: string;
  title: string;
  detail: string;
  status: string;
  severity: "critical" | "attention" | "watch" | "positive";
  href: string;
  date: string;
};

export type ReportRecommendation = {
  id: string;
  priority: "Now" | "Next" | "Maintain";
  module: string;
  title: string;
  detail: string;
  href: string;
};

export type ExecutiveReportMetrics = {
  totals: {
    records: number;
    active: number;
    needsAttention: number;
    activity: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  kpis: {
    total: number;
    completed: number;
    delayed: number;
    critical: number;
    overdue: number;
  };
  content: {
    total: number;
    approved: number;
    posted: number;
    needsReview: number;
  };
  assets: {
    total: number;
    ready: number;
    priority: number;
  };
  events: {
    total: number;
    upcoming30: number;
    planned: number;
  };
  people: {
    total: number;
    upcoming30: number;
  };
  approvals: {
    total: number;
    approved: number;
    pending: number;
    overdue: number;
  };
  intelligence: {
    total: number;
    recent: number;
    highRelevance: number;
  };
  studio: {
    total: number;
    ready: number;
  };
};

export type ExecutiveReport = {
  generatedAt: string;
  periodStart: string | null;
  periodEnd: string;
  range: ReportRange;
  rangeLabel: string;
  score: number;
  signal: string;
  summary: string;
  metrics: ExecutiveReportMetrics;
  dimensions: ReportDimension[];
  evidence: ReportEvidence[];
  recommendations: ReportRecommendation[];
  methodology: string;
};

export type ExecutiveReportSnapshotDto = {
  id: string;
  title: string;
  range: ReportRange;
  periodStart: string | null;
  periodEnd: string;
  score: number;
  signal: string;
  summary: string;
  metrics: ExecutiveReportMetrics;
  dimensions: ReportDimension[];
  evidence: ReportEvidence[];
  recommendations: ReportRecommendation[];
  createdBy: string;
  sourceVersion: number;
  createdAt: string;
};

const dayMs = 24 * 60 * 60 * 1000;

function cleanDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function daysUntil(value: string, now: Date) {
  const date = cleanDate(value);
  if (!date) return Number.POSITIVE_INFINITY;
  return Math.round((date.getTime() - startOfUtcDay(now).getTime()) / dayMs);
}

function daysUntilBirthday(month: number, day: number, now: Date) {
  const today = startOfUtcDay(now);
  let next = new Date(Date.UTC(today.getUTCFullYear(), month - 1, day));
  if (next.getTime() < today.getTime()) {
    next = new Date(Date.UTC(today.getUTCFullYear() + 1, month - 1, day));
  }
  return Math.round((next.getTime() - today.getTime()) / dayMs);
}

function isOneOf(value: string, candidates: string[]) {
  const normalized = value.trim().toLowerCase();
  return candidates.some((candidate) => candidate.toLowerCase() === normalized);
}

function ratioScore(numerator: number, denominator: number, fallback: number) {
  if (denominator <= 0) return fallback;
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}

function reportWindow(range: ReportRange, now: Date) {
  if (range === "all") {
    return { start: null, label: "All recorded activity" };
  }

  const days = Number.parseInt(range, 10);
  return {
    start: new Date(now.getTime() - (days - 1) * dayMs),
    label: `Trailing ${days} days`,
  };
}

export function normalizeReportRange(value: unknown): ReportRange {
  return reportRanges.includes(value as ReportRange)
    ? (value as ReportRange)
    : "30d";
}

function scoreSignal(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Steady";
  return "Needs focus";
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function safeJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function buildExecutiveReport(
  rangeInput: unknown = "30d"
): Promise<ExecutiveReport> {
  const range = normalizeReportRange(rangeInput);
  const now = new Date();
  const window = reportWindow(range, now);

  const [
    projects,
    kpis,
    social,
    assets,
    events,
    birthdays,
    approvals,
    news,
    studio,
  ] = await Promise.all([
    prisma.projectRecord.findMany(),
    prisma.kpiItem.findMany(),
    prisma.socialDraft.findMany(),
    prisma.assetRecord.findMany(),
    prisma.globalEvent.findMany(),
    prisma.birthdayProfile.findMany(),
    prisma.approvalRequest.findMany(),
    prisma.newsItem.findMany(),
    prisma.aiDraft.findMany(),
  ]);

  const isCurrentActivity = (updatedAt: Date) =>
    window.start === null || updatedAt.getTime() >= window.start.getTime();
  const isPendingApproval = (status: string) =>
    isOneOf(status, ["Pending", "Changes Requested"]);
  const isCompleteProject = (status: string) =>
    isOneOf(status, ["Completed", "Complete", "Done"]);
  const isActiveProject = (status: string) =>
    !isCompleteProject(status) && !isOneOf(status, ["Archived", "Cancelled"]);
  const isCompletedKpi = (status: string) =>
    isOneOf(status, ["Completed", "Complete", "Done"]);

  const overdueProjects = projects.filter(
    (item) =>
      isActiveProject(item.status) &&
      daysUntil(item.dueDate, now) < 0
  );
  const overdueKpis = kpis.filter(
    (item) =>
      !isCompletedKpi(item.status) &&
      daysUntil(item.dueDate, now) < 0
  );
  const delayedKpis = kpis.filter((item) =>
    isOneOf(item.status, ["Delayed", "Blocked", "At Risk"])
  );
  const criticalKpis = kpis.filter((item) =>
    isOneOf(item.priority, ["Critical", "Urgent"])
  );
  const pendingApprovals = approvals.filter((item) =>
    isPendingApproval(item.status)
  );
  const overdueApprovals = pendingApprovals.filter(
    (item) => daysUntil(item.dueDate, now) < 0
  );
  const upcomingEvents = events.filter((item) => {
    const days = daysUntil(item.date, now);
    return days >= 0 && days <= 30;
  });
  const upcomingBirthdays = birthdays.filter((item) => {
    const days = daysUntilBirthday(item.month, item.day, now);
    return days >= 0 && days <= 30;
  });
  const recentNews = news.filter((item) => {
    const signalDate = item.publishedAt ?? item.collectedAt;
    return now.getTime() - signalDate.getTime() <= 7 * dayMs;
  });
  const highRelevanceNews = news.filter(
    (item) =>
      isOneOf(item.relevance, ["High", "Critical"]) || item.score >= 75
  );

  const completedProjects = projects.filter((item) =>
    isCompleteProject(item.status)
  );
  const completedKpis = kpis.filter((item) => isCompletedKpi(item.status));
  const postedContent = social.filter((item) =>
    isOneOf(item.status, ["Posted", "Published"])
  );
  const approvedContent = social.filter((item) =>
    isOneOf(item.status, ["Approved", "Posted", "Published"])
  );
  const readyAssets = assets.filter((item) =>
    isOneOf(item.status, ["Ready", "Approved", "Published"])
  );
  const plannedEvents = events.filter((item) =>
    isOneOf(item.status, ["Planned", "Ready", "Published", "Completed"])
  );
  const approvedRequests = approvals.filter((item) =>
    isOneOf(item.status, ["Approved"])
  );
  const readyStudio = studio.filter((item) =>
    isOneOf(item.status, ["Approved", "Ready", "Published"])
  );

  const allRecords = [
    ...projects,
    ...kpis,
    ...social,
    ...assets,
    ...events,
    ...birthdays,
    ...approvals,
    ...news,
    ...studio,
  ];
  const activity = allRecords.filter((item) =>
    isCurrentActivity(item.updatedAt)
  ).length;
  const needsAttention =
    overdueProjects.length +
    delayedKpis.length +
    overdueKpis.length +
    overdueApprovals.length +
    criticalKpis.filter((item) => !isCompletedKpi(item.status)).length;

  const metrics: ExecutiveReportMetrics = {
    totals: {
      records: allRecords.length,
      active:
        projects.filter((item) => isActiveProject(item.status)).length +
        kpis.filter((item) => !isCompletedKpi(item.status)).length +
        pendingApprovals.length,
      needsAttention,
      activity,
    },
    projects: {
      total: projects.length,
      active: projects.filter((item) => isActiveProject(item.status)).length,
      completed: completedProjects.length,
      overdue: overdueProjects.length,
    },
    kpis: {
      total: kpis.length,
      completed: completedKpis.length,
      delayed: delayedKpis.length,
      critical: criticalKpis.length,
      overdue: overdueKpis.length,
    },
    content: {
      total: social.length,
      approved: approvedContent.length,
      posted: postedContent.length,
      needsReview: social.filter(
        (item) =>
          !isOneOf(item.status, ["Approved", "Posted", "Published", "Archived"])
      ).length,
    },
    assets: {
      total: assets.length,
      ready: readyAssets.length,
      priority: assets.filter((item) =>
        isOneOf(item.priority, ["High", "Critical", "Urgent"])
      ).length,
    },
    events: {
      total: events.length,
      upcoming30: upcomingEvents.length,
      planned: plannedEvents.length,
    },
    people: {
      total: birthdays.length,
      upcoming30: upcomingBirthdays.length,
    },
    approvals: {
      total: approvals.length,
      approved: approvedRequests.length,
      pending: pendingApprovals.length,
      overdue: overdueApprovals.length,
    },
    intelligence: {
      total: news.length,
      recent: recentNews.length,
      highRelevance: highRelevanceNews.length,
    },
    studio: {
      total: studio.length,
      ready: readyStudio.length,
    },
  };

  const executionScore = ratioScore(
    completedProjects.length + completedKpis.length + postedContent.length,
    projects.length + kpis.length + social.length,
    50
  );
  const readinessScore = ratioScore(
    readyAssets.length + plannedEvents.length + approvedContent.length,
    assets.length + events.length + social.length,
    55
  );
  const governanceScore =
    approvals.length === 0
      ? 72
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              100 -
                (pendingApprovals.length / approvals.length) * 30 -
                (overdueApprovals.length / approvals.length) * 55
            )
          )
        );
  const foresightBase =
    events.length + birthdays.length === 0
      ? 35
      : Math.min(100, 62 + upcomingEvents.length * 5 + upcomingBirthdays.length * 3);
  const foresightScore = Math.max(
    0,
    foresightBase - overdueProjects.length * 4 - overdueKpis.length * 4
  );

  const dimensions: ReportDimension[] = [
    {
      key: "execution",
      label: "Execution",
      score: executionScore,
      note: `${completedProjects.length + completedKpis.length} completed outcome${
        completedProjects.length + completedKpis.length === 1 ? "" : "s"
      }`,
    },
    {
      key: "readiness",
      label: "Readiness",
      score: readinessScore,
      note: `${readyAssets.length + approvedContent.length} approved or ready item${
        readyAssets.length + approvedContent.length === 1 ? "" : "s"
      }`,
    },
    {
      key: "governance",
      label: "Governance",
      score: governanceScore,
      note:
        overdueApprovals.length > 0
          ? `${formatCount(overdueApprovals.length, "decision")} overdue`
          : "No overdue decisions",
    },
    {
      key: "foresight",
      label: "Foresight",
      score: foresightScore,
      note: `${upcomingEvents.length + upcomingBirthdays.length} moment${
        upcomingEvents.length + upcomingBirthdays.length === 1 ? "" : "s"
      } visible in 30 days`,
    },
  ];

  const score = Math.round(
    executionScore * 0.35 +
      readinessScore * 0.25 +
      governanceScore * 0.25 +
      foresightScore * 0.15
  );
  const signal = scoreSignal(score);

  const evidence: ReportEvidence[] = [
    ...overdueApprovals.map((item) => ({
      id: `approval-${item.id}`,
      module: "Approvals",
      title: item.title,
      detail: `Decision was due ${item.dueDate || "without a recorded date"}.`,
      status: item.status,
      severity: "critical" as const,
      href: "/approvals",
      date: item.dueDate,
    })),
    ...overdueKpis.map((item) => ({
      id: `kpi-${item.id}`,
      module: "KPI",
      title: item.title,
      detail: `${item.owner || "Unassigned"} · due ${item.dueDate}.`,
      status: item.status,
      severity: "critical" as const,
      href: "/kpi",
      date: item.dueDate,
    })),
    ...overdueProjects.map((item) => ({
      id: `project-${item.id}`,
      module: "Projects",
      title: item.name,
      detail: `${item.owner || "Unassigned"} · due ${item.dueDate}.`,
      status: item.status,
      severity: "attention" as const,
      href: "/projects",
      date: item.dueDate,
    })),
    ...delayedKpis
      .filter((item) => !overdueKpis.some((overdue) => overdue.id === item.id))
      .map((item) => ({
        id: `kpi-delayed-${item.id}`,
        module: "KPI",
        title: item.title,
        detail: item.description || "This KPI is marked as delayed or blocked.",
        status: item.status,
        severity: "attention" as const,
        href: "/kpi",
        date: item.dueDate,
      })),
    ...upcomingEvents.map((item) => ({
      id: `event-${item.id}`,
      module: "Events",
      title: item.title,
      detail: `${item.category} · ${daysUntil(item.date, now)} days away.`,
      status: item.status,
      severity:
        daysUntil(item.date, now) <= 7
          ? ("attention" as const)
          : ("watch" as const),
      href: `/events?event=workspace-${item.id}#event-atlas`,
      date: item.date,
    })),
    ...upcomingBirthdays.map((item) => ({
      id: `birthday-${item.id}`,
      module: "Birthdays",
      title: item.name,
      detail: `${item.role || item.category || "Birthday profile"} · ${daysUntilBirthday(
        item.month,
        item.day,
        now
      )} days away.`,
      status: "Upcoming",
      severity: "watch" as const,
      href: "/birthdays",
      date: `${String(item.month).padStart(2, "0")}-${String(item.day).padStart(
        2,
        "0"
      )}`,
    })),
    ...highRelevanceNews.slice(0, 4).map((item) => ({
      id: `news-${item.id}`,
      module: "Intelligence",
      title: item.headline,
      detail: `${item.source || "Saved source"} · relevance ${item.score || item.relevance}.`,
      status: item.status,
      severity: "watch" as const,
      href: "/news",
      date: (item.publishedAt ?? item.collectedAt).toISOString(),
    })),
  ]
    .sort((a, b) => {
      const severityOrder = { critical: 0, attention: 1, watch: 2, positive: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 14);

  const recommendations: ReportRecommendation[] = [];
  if (overdueApprovals.length > 0) {
    recommendations.push({
      id: "clear-overdue-approvals",
      priority: "Now",
      module: "Approvals",
      title: `Resolve ${formatCount(overdueApprovals.length, "overdue decision")}`,
      detail:
        "Record a decision or a clear change request so dependent work can move.",
      href: "/approvals",
    });
  }
  if (overdueKpis.length + delayedKpis.length > 0) {
    const atRiskKpiCount = new Set(
      [...overdueKpis, ...delayedKpis].map((item) => item.id)
    ).size;
    recommendations.push({
      id: "recover-kpis",
      priority: "Now",
      module: "KPI",
      title: "Recover at-risk outcomes",
      detail: `${formatCount(atRiskKpiCount, "KPI")} ${
        atRiskKpiCount === 1 ? "needs" : "need"
      } a new owner, date, or escalation decision.`,
      href: "/kpi",
    });
  }
  if (upcomingEvents.length > 0) {
    recommendations.push({
      id: "prepare-calendar",
      priority: "Next",
      module: "Events",
      title: "Convert the next moments into prepared work",
      detail: `${formatCount(
        upcomingEvents.length,
        "event"
      )} ${
        upcomingEvents.length === 1 ? "lands" : "land"
      } within 30 days; confirm owners, assets, and approvals early.`,
      href: "/events",
    });
  }
  if (social.length > approvedContent.length) {
    recommendations.push({
      id: "move-content",
      priority: "Next",
      module: "Social",
      title: "Move drafts toward a decision",
      detail: `${formatCount(
        social.length - approvedContent.length,
        "draft"
      )} are not yet approved or published.`,
      href: "/social",
    });
  }
  if (assets.length > readyAssets.length) {
    recommendations.push({
      id: "ready-assets",
      priority: "Next",
      module: "Assets",
      title: "Finish the working asset set",
      detail: `${formatCount(
        assets.length - readyAssets.length,
        "asset"
      )} ${
        assets.length - readyAssets.length === 1 ? "is" : "are"
      } not yet marked ready or approved.`,
      href: "/assets",
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      id: "maintain-command",
      priority: "Maintain",
      module: "Command",
      title: "Protect the current operating rhythm",
      detail:
        "No urgent recovery signal is visible. Keep dates, decisions, and outcomes current.",
      href: "/command",
    });
  }

  const summary =
    needsAttention > 0
      ? `Morrow is tracking ${formatCount(
          allRecords.length,
          "record"
        )}. The command picture is ${signal.toLowerCase()}, with ${formatCount(
          needsAttention,
          "attention signal"
        )} requiring ownership. The clearest immediate pressure sits in ${
          overdueApprovals.length > 0
            ? "decision flow"
            : overdueKpis.length + delayedKpis.length > 0
              ? "KPI delivery"
              : "project timing"
        }.`
      : `Morrow is tracking ${formatCount(
          allRecords.length,
          "record"
        )} with no overdue command signal detected. The operating picture is ${signal.toLowerCase()}; the next advantage is preparing the ${
          upcomingEvents.length + upcomingBirthdays.length
        } visible calendar moment${
          upcomingEvents.length + upcomingBirthdays.length === 1 ? "" : "s"
        } before they become urgent.`;

  return {
    generatedAt: now.toISOString(),
    periodStart: window.start?.toISOString() ?? null,
    periodEnd: now.toISOString(),
    range,
    rangeLabel: window.label,
    score,
    signal,
    summary,
    metrics,
    dimensions,
    evidence,
    recommendations,
    methodology:
      "Calculated deterministically from saved Morrow records. No generative AI is used to invent, estimate, or fill missing operational data.",
  };
}

export function toSnapshotDto(snapshot: {
  id: string;
  title: string;
  range: string;
  periodStart: Date | null;
  periodEnd: Date;
  score: number;
  signal: string;
  summary: string;
  metricsJson: string;
  dimensionsJson: string;
  evidenceJson: string;
  recommendationsJson: string;
  createdBy: string;
  sourceVersion: number;
  createdAt: Date;
}): ExecutiveReportSnapshotDto {
  return {
    id: snapshot.id,
    title: snapshot.title,
    range: normalizeReportRange(snapshot.range),
    periodStart: snapshot.periodStart?.toISOString() ?? null,
    periodEnd: snapshot.periodEnd.toISOString(),
    score: snapshot.score,
    signal: snapshot.signal,
    summary: snapshot.summary,
    metrics: safeJson(snapshot.metricsJson, {} as ExecutiveReportMetrics),
    dimensions: safeJson(snapshot.dimensionsJson, [] as ReportDimension[]),
    evidence: safeJson(snapshot.evidenceJson, [] as ReportEvidence[]),
    recommendations: safeJson(
      snapshot.recommendationsJson,
      [] as ReportRecommendation[]
    ),
    createdBy: snapshot.createdBy,
    sourceVersion: snapshot.sourceVersion,
    createdAt: snapshot.createdAt.toISOString(),
  };
}

export function defaultSnapshotTitle(report: ExecutiveReport) {
  return `Executive pulse · ${new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(report.generatedAt))}`;
}
