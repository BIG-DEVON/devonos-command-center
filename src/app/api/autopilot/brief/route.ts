import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SignalSeverity = "critical" | "high" | "medium" | "low";

type CommandSignal = {
  id: string;
  module: string;
  title: string;
  detail: string;
  severity: SignalSeverity;
  href: string;
  action: string;
  sortScore: number;
};

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDaysUntil(dateString: string) {
  if (!dateString) return 999999;

  const today = todayStart();
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  if (Number.isNaN(date.getTime())) return 999999;

  const diff = date.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string) {
  if (!dateString) return "No date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "No date";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getNextBirthday(month: number, day: number) {
  const today = todayStart();

  let birthday = new Date(today.getFullYear(), month - 1, day);
  birthday.setHours(0, 0, 0, 0);

  if (birthday.getTime() < today.getTime()) {
    birthday = new Date(today.getFullYear() + 1, month - 1, day);
    birthday.setHours(0, 0, 0, 0);
  }

  return birthday;
}

function getDaysUntilBirthday(month: number, day: number) {
  const today = todayStart();
  const birthday = getNextBirthday(month, day);
  const diff = birthday.getTime() - today.getTime();

  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatBirthday(month: number, day: number) {
  const birthday = new Date(new Date().getFullYear(), month - 1, day);

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
  }).format(birthday);
}

function severityScore(severity: SignalSeverity) {
  if (severity === "critical") return 1;
  if (severity === "high") return 2;
  if (severity === "medium") return 3;
  return 4;
}

function signal(
  data: Omit<CommandSignal, "id"> & {
    id?: string;
  }
): CommandSignal {
  return {
    id:
      data.id ??
      `${data.module}-${data.title}-${Math.random().toString(36).slice(2)}`,
    module: data.module,
    title: data.title,
    detail: data.detail,
    severity: data.severity,
    href: data.href,
    action: data.action,
    sortScore: data.sortScore,
  };
}

function buildBriefText(signals: CommandSignal[]) {
  const critical = signals.filter((item) => item.severity === "critical");
  const high = signals.filter((item) => item.severity === "high");
  const medium = signals.filter((item) => item.severity === "medium");

  const prioritySignals = [...critical, ...high, ...medium].slice(0, 8);

  if (signals.length === 0) {
    return [
      "DEVONOS DAILY COMMAND BRIEF",
      "",
      "Status: Clear",
      "",
      "No urgent signals were detected from your database today.",
      "",
      "Recommended next step:",
      "Use the quiet window to prepare content, update project notes, review pending drafts, and keep your communication pipeline clean.",
    ].join("\n");
  }

  return [
    "DEVONOS DAILY COMMAND BRIEF",
    "",
    `Generated: ${new Intl.DateTimeFormat("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date())}`,
    "",
    `Critical Signals: ${critical.length}`,
    `High Priority Signals: ${high.length}`,
    `Medium Priority Signals: ${medium.length}`,
    `Total Signals: ${signals.length}`,
    "",
    "Top Priorities:",
    ...prioritySignals.flatMap((item, index) => [
      "",
      `${index + 1}. ${item.title}`,
      `Module: ${item.module}`,
      `Severity: ${item.severity.toUpperCase()}`,
      `Detail: ${item.detail}`,
      `Recommended Action: ${item.action}`,
    ]),
    "",
    "Command Recommendation:",
    "Start with critical and high-priority items first. Clear overdue work, prepare upcoming communication moments, review pending social drafts, and convert high-relevance news signals into approved briefs or content.",
  ].join("\n");
}

export async function GET() {
  try {
    const [
      kpis,
      projects,
      socialDrafts,
      assets,
      events,
      birthdays,
      aiDrafts,
      newsItems,
    ] = await Promise.all([
      prisma.kpiItem.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.projectRecord.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.socialDraft.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.assetRecord.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.globalEvent.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.birthdayProfile.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.aiDraft.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.newsItem.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const signals: CommandSignal[] = [];

    for (const kpi of kpis) {
      const days = getDaysUntil(kpi.dueDate);
      const isCompleted = kpi.status === "Completed";

      if (!isCompleted && days < 0) {
        signals.push(
          signal({
            module: "KPI Command",
            title: `Overdue KPI: ${kpi.title}`,
            detail: `${kpi.title} was due on ${formatDate(kpi.dueDate)} and is still marked as ${kpi.status}.`,
            severity: kpi.priority === "Critical" ? "critical" : "high",
            href: "/kpi",
            action:
              "Open KPI Command, update the status, add progress notes, or escalate the blocker.",
            sortScore: severityScore(kpi.priority === "Critical" ? "critical" : "high") * 100 + Math.abs(days),
          })
        );
      }

      if (!isCompleted && days >= 0 && days <= 3) {
        signals.push(
          signal({
            module: "KPI Command",
            title: `KPI due soon: ${kpi.title}`,
            detail: `${kpi.title} is due on ${formatDate(kpi.dueDate)}.`,
            severity: kpi.priority === "Critical" ? "high" : "medium",
            href: "/kpi",
            action:
              "Review the KPI today and confirm what needs to be completed before the deadline.",
            sortScore: severityScore(kpi.priority === "Critical" ? "high" : "medium") * 100 + days,
          })
        );
      }

      if (kpi.status === "Blocked" || kpi.status === "Delayed") {
        signals.push(
          signal({
            module: "KPI Command",
            title: `KPI needs attention: ${kpi.title}`,
            detail: `${kpi.title} is marked as ${kpi.status}.`,
            severity: kpi.status === "Blocked" ? "critical" : "high",
            href: "/kpi",
            action:
              "Add a clear blocker note and decide the next action needed to unblock it.",
            sortScore: severityScore(kpi.status === "Blocked" ? "critical" : "high") * 100 + 5,
          })
        );
      }
    }

    for (const project of projects) {
      const days = getDaysUntil(project.dueDate);
      const isCompleted = project.status === "Completed";

      if (!isCompleted && days < 0) {
        signals.push(
          signal({
            module: "Projects",
            title: `Overdue project: ${project.name}`,
            detail: `${project.name} was due on ${formatDate(project.dueDate)} and is currently ${project.status}.`,
            severity: project.priority === "Critical" ? "critical" : "high",
            href: "/projects",
            action:
              "Open the project, update its status, and define the next deliverable.",
            sortScore: severityScore(project.priority === "Critical" ? "critical" : "high") * 100 + Math.abs(days),
          })
        );
      }

      if (!isCompleted && days >= 0 && days <= 7) {
        signals.push(
          signal({
            module: "Projects",
            title: `Project deadline approaching: ${project.name}`,
            detail: `${project.name} is due on ${formatDate(project.dueDate)}.`,
            severity: project.priority === "Critical" ? "high" : "medium",
            href: "/projects",
            action:
              "Check deliverables, review notes, and prepare the next execution step.",
            sortScore: severityScore(project.priority === "Critical" ? "high" : "medium") * 100 + days,
          })
        );
      }

      if (project.status === "Paused") {
        signals.push(
          signal({
            module: "Projects",
            title: `Paused project: ${project.name}`,
            detail: `${project.name} is paused and may need review.`,
            severity: "medium",
            href: "/projects",
            action:
              "Decide whether to resume, archive, or redefine the project.",
            sortScore: severityScore("medium") * 100 + 12,
          })
        );
      }
    }

    for (const event of events) {
      const days = getDaysUntil(event.date);

      if (days >= 0 && days <= 7 && event.status !== "Posted") {
        signals.push(
          signal({
            module: "Global Events",
            title: `Upcoming event: ${event.title}`,
            detail: `${event.title} is ${days === 0 ? "today" : `in ${days} day(s)`}. Status: ${event.status}.`,
            severity: event.relevance === "High" ? "high" : "medium",
            href: "/events",
            action:
              "Prepare the caption, visual direction, and approval path for this event.",
            sortScore: severityScore(event.relevance === "High" ? "high" : "medium") * 100 + days,
          })
        );
      }
    }

    for (const birthday of birthdays) {
      const days = getDaysUntilBirthday(birthday.month, birthday.day);

      if (days >= 0 && days <= 7) {
        signals.push(
          signal({
            module: "Birthdays",
            title: `Birthday reminder: ${birthday.name}`,
            detail: `${birthday.name}'s birthday is ${days === 0 ? "today" : `in ${days} day(s)`} on ${formatBirthday(birthday.month, birthday.day)}.`,
            severity: days === 0 ? "high" : "medium",
            href: "/birthdays",
            action:
              "Generate or copy a birthday message and prepare any design or post needed.",
            sortScore: severityScore(days === 0 ? "high" : "medium") * 100 + days,
          })
        );
      }
    }

    for (const draft of socialDrafts) {
      const days = getDaysUntil(draft.scheduledDate);

      if (draft.status === "Review" || draft.status === "Approved") {
        signals.push(
          signal({
            module: "Social Studio",
            title: `Social draft ready: ${draft.title}`,
            detail: `${draft.title} is marked as ${draft.status} for ${draft.platform}.`,
            severity: draft.status === "Approved" ? "medium" : "high",
            href: "/social",
            action:
              "Review the caption and decide whether it should be scheduled, posted, or revised.",
            sortScore: severityScore(draft.status === "Approved" ? "medium" : "high") * 100 + 10,
          })
        );
      }

      if (draft.scheduledDate && days >= 0 && days <= 2 && draft.status !== "Posted") {
        signals.push(
          signal({
            module: "Social Studio",
            title: `Scheduled post approaching: ${draft.title}`,
            detail: `${draft.title} is scheduled for ${formatDate(draft.scheduledDate)}.`,
            severity: "high",
            href: "/social",
            action:
              "Confirm approval, final caption, visual asset, and posting readiness.",
            sortScore: severityScore("high") * 100 + days,
          })
        );
      }
    }

    for (const newsItem of newsItems) {
      if (newsItem.relevance === "High") {
        signals.push(
          signal({
            module: "News Intelligence",
            title: `High-relevance news: ${newsItem.headline}`,
            detail: newsItem.summary || `Source: ${newsItem.source || "No source added"}.`,
            severity: "high",
            href: "/news/collector",
            action:
              "Verify the source, summarize implications, and decide whether to convert it into a brief or social post.",
            sortScore: severityScore("high") * 100 + 8,
          })
        );
      }
    }

    const readyAssets = assets.filter(
      (asset) => asset.status === "Ready" || asset.status === "Approved"
    );

    if (readyAssets.length > 0) {
      signals.push(
        signal({
          module: "Assets",
          title: `${readyAssets.length} asset(s) ready for use`,
          detail:
            "You have approved or ready creative assets that may be used in current content work.",
          severity: "low",
          href: "/assets",
          action:
            "Open Asset Library and attach relevant assets to social drafts, projects, or reports.",
          sortScore: severityScore("low") * 100 + 30,
        })
      );
    }

    const generatedAiDrafts = aiDrafts.filter(
      (draft) => draft.status === "Generated"
    );

    if (generatedAiDrafts.length > 0) {
      signals.push(
        signal({
          module: "AI Studio",
          title: `${generatedAiDrafts.length} generated AI draft(s) need review`,
          detail:
            "Generated drafts should be reviewed before they are used in official communication.",
          severity: "medium",
          href: "/ai",
          action:
            "Review generated AI drafts and mark the useful ones as Reviewed or Used.",
          sortScore: severityScore("medium") * 100 + 18,
        })
      );
    }

    const sortedSignals = signals.sort((a, b) => {
      if (a.sortScore !== b.sortScore) return a.sortScore - b.sortScore;
      return a.title.localeCompare(b.title);
    });

    const criticalSignals = sortedSignals.filter(
      (item) => item.severity === "critical"
    );

    const highSignals = sortedSignals.filter((item) => item.severity === "high");

    const mediumSignals = sortedSignals.filter(
      (item) => item.severity === "medium"
    );

    const lowSignals = sortedSignals.filter((item) => item.severity === "low");

    const briefText = buildBriefText(sortedSignals);

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      health:
        criticalSignals.length > 0
          ? "critical"
          : highSignals.length > 0
            ? "attention"
            : "stable",
      counts: {
        kpis: kpis.length,
        projects: projects.length,
        socialDrafts: socialDrafts.length,
        assets: assets.length,
        events: events.length,
        birthdays: birthdays.length,
        aiDrafts: aiDrafts.length,
        newsItems: newsItems.length,
        signals: sortedSignals.length,
        critical: criticalSignals.length,
        high: highSignals.length,
        medium: mediumSignals.length,
        low: lowSignals.length,
      },
      signals: sortedSignals,
      topSignals: sortedSignals.slice(0, 8),
      briefText,
    });
  } catch (error) {
    console.error("Autopilot brief failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "DevonOS Autopilot could not generate the command brief.",
      },
      { status: 500 }
    );
  }
}