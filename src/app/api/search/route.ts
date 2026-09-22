import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mainNavigation, utilityNavigation } from "@/config/navigation";
import { morrowObservances } from "@/data/morrow-observances";
import { getHallOfFameMembers } from "@/lib/hall-of-fame";
import {
  scoreSearchResult,
  type SearchKind,
  type UniversalSearchResult,
} from "@/lib/universal-search";

function clean(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function join(...values: unknown[]) {
  return values.map(clean).filter(Boolean).join(" · ");
}

function searchable(...values: unknown[]) {
  return values.map(clean).filter(Boolean).join(" ");
}

function result(
  value: Omit<UniversalSearchResult, "imageUrl" | "date" | "keywords"> &
    Partial<
      Pick<UniversalSearchResult, "imageUrl" | "date" | "keywords">
    >
): UniversalSearchResult {
  return {
    imageUrl: "",
    date: "",
    keywords: "",
    ...value,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim() ?? "";
    const requestedLimit = Number(url.searchParams.get("limit") ?? 80);
    const limit = Math.min(150, Math.max(1, requestedLimit || 80));

    const [
      people,
      kpis,
      projects,
      socialDrafts,
      assets,
      events,
      birthdays,
      news,
      approvals,
      aiDrafts,
      autopilotTasks,
      automations,
      notifications,
      digests,
      reportSnapshots,
    ] = await Promise.all([
      getHallOfFameMembers(),
      prisma.kpiItem.findMany({ orderBy: { updatedAt: "desc" }, take: 250 }),
      prisma.projectRecord.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      prisma.socialDraft.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      prisma.assetRecord.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      prisma.globalEvent.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      prisma.birthdayProfile.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      prisma.newsItem.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      prisma.approvalRequest.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      prisma.aiDraft.findMany({ orderBy: { updatedAt: "desc" }, take: 250 }),
      prisma.autopilotTask.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      prisma.automationSchedule.findMany({
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
      prisma.notificationRecord.findMany({
        orderBy: { updatedAt: "desc" },
        take: 150,
      }),
      prisma.newsDigest.findMany({
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
      prisma.executiveReportSnapshot.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    const navigationResults = [...mainNavigation, ...utilityNavigation].map(
      (item) =>
        result({
          id: `workspace:${item.href}`,
          kind: "Workspace",
          title: item.name,
          subtitle: item.description,
          body: `Open the ${item.name} workspace in Morrow.`,
          status: "Workspace",
          href: item.href,
          keywords: `module page command center ${item.name}`,
          actionLabel: "Open workspace",
        })
    );

    const peopleResults = people.map((member) =>
      result({
        id: `person:${member.id}`,
        kind: "People",
        title: member.name,
        subtitle: join(member.designation, member.organization),
        body:
          member.status === "verified"
            ? `${member.group} member with an approved labelled portrait.`
            : "Portrait is available; identity details still need verification.",
        status:
          member.status === "verified" ? "Portrait verified" : "Verify details",
        href: `/birthdays?member=${member.id}#hall-of-fame`,
        imageUrl: member.photoUrl,
        keywords: searchable(
          member.group,
          member.organization,
          member.designation,
          `portrait ${member.photoNumber}`,
          "hall of fame board member"
        ),
        actionLabel: "View member",
      })
    );

    const plannedEventsByKey = new Map(
      events.map((event) => [
        `${event.title}|${event.date}`.toLowerCase(),
        event,
      ])
    );
    const curatedEventKeys = new Set(
      morrowObservances.map((event) =>
        `${event.title}|${event.date}`.toLowerCase()
      )
    );
    const observanceResults = morrowObservances.map((event) => {
      const planned = plannedEventsByKey.get(
        `${event.title}|${event.date}`.toLowerCase()
      );

      return result({
        id: `observance:${event.id}`,
        kind: "Events",
        title: event.title,
        subtitle: join(
          event.date,
          event.kind,
          event.scopes.join(" · ")
        ),
        body: `${event.summary} ${event.jrbAngle}`,
        status: planned
          ? `Planned · ${planned.status}`
          : `${event.verification} source`,
        href: `/events?event=${event.id}#event-atlas`,
        date: event.date,
        keywords: searchable(
          event.scopes.join(" "),
          event.kind,
          event.relevance,
          event.verification,
          event.authority,
          event.contentCue,
          event.visualCue,
          event.series,
          event.publicHoliday ? "public holiday bank holiday day off" : "",
          "world calendar nigeria jrb notable day observance celebration"
        ),
        actionLabel: "View in year atlas",
      });
    });
    const customEvents = events.filter(
      (event) =>
        !curatedEventKeys.has(`${event.title}|${event.date}`.toLowerCase())
    );

    const recordResults: UniversalSearchResult[] = [
      ...kpis.map((item) =>
        result({
          id: `kpi:${item.id}`,
          kind: "KPI",
          title: item.title,
          subtitle: join(item.owner, item.priority, item.status),
          body: item.description || item.outcome || item.notes,
          status: item.status,
          href: "/kpi",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.owner,
            item.priority,
            item.dueDate,
            item.outcome,
            item.notes
          ),
          actionLabel: "Open KPI",
        })
      ),
      ...projects.map((item) =>
        result({
          id: `project:${item.id}`,
          kind: "Projects",
          title: item.name,
          subtitle: join(item.owner, item.category, item.status),
          body: item.objective || item.deliverables || item.notes,
          status: item.status,
          href: "/projects",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.priority,
            item.startDate,
            item.dueDate,
            item.deliverables,
            item.notes
          ),
          actionLabel: "Open project",
        })
      ),
      ...socialDrafts.map((item) =>
        result({
          id: `social:${item.id}`,
          kind: "Social",
          title: item.title,
          subtitle: join(item.platform, item.campaign, item.status),
          body: item.caption || item.visualDirection || item.notes,
          status: item.status,
          href: "/social",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.hashtags,
            item.scheduledDate,
            item.visualDirection,
            item.notes
          ),
          actionLabel: "Open social draft",
        })
      ),
      ...assets.map((item) =>
        result({
          id: `asset:${item.id}`,
          kind: "Assets",
          title: item.name,
          subtitle: join(item.type, item.project, item.status),
          body: item.notes || item.tags || item.link,
          status: item.status,
          href: "/assets",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.priority,
            item.project,
            item.tags,
            item.link,
            item.notes
          ),
          actionLabel: "Open asset",
        })
      ),
      ...customEvents.map((item) =>
        result({
          id: `event:${item.id}`,
          kind: "Events",
          title: item.title,
          subtitle: join(item.date, item.category, item.relevance),
          body: item.contentAngle || item.captionDraft || item.notes,
          status: item.status,
          href: `/events?event=workspace-${item.id}#event-atlas`,
          date: item.date || item.updatedAt.toISOString(),
          keywords: searchable(
            item.category,
            item.relevance,
            item.visualDirection,
            item.captionDraft,
            item.notes,
            "custom event calendar moment"
          ),
          actionLabel: "Open event",
        })
      ),
      ...birthdays.map((item) =>
        result({
          id: `birthday:${item.id}`,
          kind: "Birthdays",
          title: item.name,
          subtitle: join(
            item.role,
            item.category,
            `${item.day}/${item.month}`
          ),
          body: item.notes || "Confirmed birthday profile.",
          status: item.preferredTone,
          href: "/birthdays",
          imageUrl: item.photoUrl,
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.month,
            item.day,
            item.role,
            item.category,
            item.preferredTone
          ),
          actionLabel: "Open birthday",
        })
      ),
      ...news.map((item) =>
        result({
          id: `news:${item.id}`,
          kind: "News",
          title: item.headline,
          subtitle: join(item.source, item.topic, item.relevance),
          body: item.summary || item.notes,
          status: item.status,
          href: "/news",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.author,
            item.channel,
            item.contentType,
            item.sourceDomain,
            item.url,
            item.notes
          ),
          actionLabel: "Open signal",
        })
      ),
      ...digests.map((item) =>
        result({
          id: `digest:${item.id}`,
          kind: "News",
          title: item.title,
          subtitle: join("News digest", item.date, item.status),
          body: item.content,
          status: item.status,
          href: "/news",
          date: item.updatedAt.toISOString(),
          keywords: searchable("digest intelligence brief", item.itemIds),
          actionLabel: "Open digest",
        })
      ),
      ...reportSnapshots.map((item) =>
        result({
          id: `report:${item.id}`,
          kind: "Reports",
          title: item.title,
          subtitle: join(
            "Executive snapshot",
            `${item.score}/100`,
            item.signal,
            item.range.toUpperCase()
          ),
          body: item.summary,
          status: "Immutable snapshot",
          href: "/reports",
          date: item.createdAt.toISOString(),
          keywords: searchable(
            item.createdBy,
            item.range,
            item.signal,
            item.metricsJson,
            item.recommendationsJson,
            "executive report command health snapshot history evidence"
          ),
          actionLabel: "Open reports",
        })
      ),
      ...approvals.map((item) =>
        result({
          id: `approval:${item.id}`,
          kind: "Approvals",
          title: item.title,
          subtitle: join(item.module, item.approver, item.priority),
          body: item.summary || item.decisionNote,
          status: item.status,
          href: "/approvals",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.requestedBy,
            item.sourceLabel,
            item.sourceHref,
            item.dueDate,
            item.decisionNote
          ),
          actionLabel: "Open decision",
        })
      ),
      ...aiDrafts.map((item) =>
        result({
          id: `ai:${item.id}`,
          kind: "AI",
          title: item.title,
          subtitle: join(item.category, item.tone, item.status),
          body: item.output || item.instruction || item.sourceText,
          status: item.status,
          href: "/ai",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.instruction,
            item.sourceText,
            item.notes
          ),
          actionLabel: "Open draft",
        })
      ),
      ...autopilotTasks.map((item) =>
        result({
          id: `autopilot:${item.id}`,
          kind: "Autopilot",
          title: item.title,
          subtitle: join(item.module, item.severity, item.dueDate),
          body: item.detail || item.action,
          status: item.status,
          href: item.href || "/autopilot",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.action,
            item.sourceSignalId,
            item.module,
            item.severity
          ),
          actionLabel: "Open task",
        })
      ),
      ...automations.map((item) =>
        result({
          id: `automation:${item.id}`,
          kind: "Automations",
          title: item.name,
          subtitle: join(item.cadence, item.time, item.timezone),
          body: item.description || item.lastSummary,
          status: item.enabled ? item.lastStatus : "Paused",
          href: "/autopilot",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.key,
            item.channels,
            item.lastSummary,
            item.lastStatus
          ),
          actionLabel: "Open automation",
        })
      ),
      ...notifications.map((item) =>
        result({
          id: `notification:${item.id}`,
          kind: "Notifications",
          title: item.title,
          subtitle: join(item.category, item.severity, item.status),
          body: item.message,
          status: item.status,
          href: item.href || "/autopilot",
          date: item.updatedAt.toISOString(),
          keywords: searchable(
            item.sourceType,
            item.sourceId,
            item.dedupeKey
          ),
          actionLabel: "Open notification",
        })
      ),
    ];

    const allResults = [
      ...navigationResults,
      ...peopleResults,
      ...observanceResults,
      ...recordResults,
    ];
    const ranked = allResults
      .map((item) => ({ ...item, score: scoreSearchResult(item, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.date.localeCompare(a.date);
      });
    const counts = ranked.reduce<Partial<Record<SearchKind, number>>>(
      (current, item) => {
        current[item.kind] = (current[item.kind] ?? 0) + 1;
        return current;
      },
      {}
    );

    return NextResponse.json({
      ok: true,
      query,
      total: ranked.length,
      indexed: allResults.length,
      results: ranked.slice(0, limit),
      counts,
    });
  } catch (error) {
    console.error("Universal search failed:", error);
    return NextResponse.json(
      {
        ok: false,
        query: "",
        total: 0,
        indexed: 0,
        results: [],
        counts: {},
        message: "Morrow could not refresh the universal index.",
      },
      { status: 500 }
    );
  }
}
