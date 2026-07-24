import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { localDateKey } from "@/lib/date";
import {
  ensureAutopilotTasks,
  getAutopilotBrief,
  type AutopilotBriefResponse,
} from "@/lib/autopilot-tasks";

function todayKey() {
  return localDateKey();
}

function formatLongDate() {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function buildMissionPlan(brief: AutopilotBriefResponse, created: number, skipped: number) {
  const topSignals = brief.topSignals.slice(0, 7);

  const signalBlock =
    topSignals.length === 0
      ? "No urgent command signals were detected today."
      : topSignals
          .map((signal, index) => {
            return [
              `${index + 1}. ${signal.title}`,
              `Module: ${signal.module}`,
              `Severity: ${signal.severity.toUpperCase()}`,
              `What it means: ${signal.detail}`,
              `Next action: ${signal.action}`,
            ].join("\n");
          })
          .join("\n\n");

  return [
    "DEVONOS DAILY MISSION PLAN",
    "",
    `Date: ${formatLongDate()}`,
    `System Health: ${brief.health.toUpperCase()}`,
    "",
    "Autopilot Setup Result:",
    `New tasks created: ${created}`,
    `Existing tasks skipped: ${skipped}`,
    "",
    "Today’s Priority Signals:",
    signalBlock,
    "",
    "Recommended Execution Order:",
    "1. Clear anything critical or high priority first.",
    "2. Review scheduled social drafts and approval-sensitive content.",
    "3. Handle KPIs or projects with upcoming deadlines.",
    "4. Convert useful news or event signals into drafts only after verification.",
    "5. Mark completed Autopilot tasks as Done so the queue stays clean.",
    "",
    "Full Command Brief:",
    brief.briefText,
  ].join("\n");
}

async function upsertDailyMissionPlan(
  brief: AutopilotBriefResponse,
  created: number,
  skipped: number
) {
  const title = `Daily Mission Plan - ${todayKey()}`;
  const output = buildMissionPlan(brief, created, skipped);

  const existingDraft = await prisma.aiDraft.findFirst({
    where: {
      title,
    },
  });

  if (existingDraft) {
    return prisma.aiDraft.update({
      where: {
        id: existingDraft.id,
      },
      data: {
        category: "Report",
        tone: "Professional",
        status: "Generated",
        instruction:
          "Review this daily mission plan and use it to organize today's communication work.",
        sourceText: brief.briefText,
        output,
        notes:
          "Updated automatically by DevonOS Start My Day. This draft is refreshed instead of duplicated.",
      },
    });
  }

  return prisma.aiDraft.create({
    data: {
      title,
      category: "Report",
      tone: "Professional",
      status: "Generated",
      instruction:
        "Review this daily mission plan and use it to organize today's communication work.",
      sourceText: brief.briefText,
      output,
      notes:
        "Generated automatically by DevonOS Start My Day. Use this as the daily work plan.",
    },
  });
}

export async function POST(request: Request) {
  try {
    const brief = await getAutopilotBrief(request);
    const taskResult = await ensureAutopilotTasks(brief);

    const aiDraft = await upsertDailyMissionPlan(
      brief,
      taskResult.created,
      taskResult.skipped
    );

    return NextResponse.json({
      ok: true,
      message:
        taskResult.created > 0
          ? `Start My Day complete. DevonOS created ${taskResult.created} new task(s), skipped ${taskResult.skipped} existing task(s), and prepared your Daily Mission Plan.`
          : `Start My Day complete. No new tasks were needed, ${taskResult.skipped} existing task(s) already cover the current signals, and your Daily Mission Plan was refreshed.`,
      createdTasks: taskResult.created,
      skippedTasks: taskResult.skipped,
      health: brief.health,
      counts: brief.counts,
      aiDraft,
      href: "/ai",
      taskHref: "/autopilot",
    });
  } catch (error) {
    console.error("Start My Day failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "DevonOS could not complete Start My Day.",
      },
      { status: 500 }
    );
  }
}
