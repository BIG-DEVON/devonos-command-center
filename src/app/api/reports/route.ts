import { NextResponse } from "next/server";
import {
  buildExecutiveReport,
  defaultSnapshotTitle,
  normalizeReportRange,
  toSnapshotDto,
} from "@/lib/executive-report";
import { getCurrentMorrowSession } from "@/lib/morrow-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const range = normalizeReportRange(new URL(request.url).searchParams.get("range"));
    const [live, snapshots] = await Promise.all([
      buildExecutiveReport(range),
      prisma.executiveReportSnapshot.findMany({
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      live,
      snapshots: snapshots.map(toSnapshotDto),
    });
  } catch (error) {
    console.error("Failed to build executive report:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Morrow could not assemble the executive report.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentMorrowSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Your Morrow session has expired." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const range = normalizeReportRange(body.range);
    const live = await buildExecutiveReport(range);
    const requestedTitle = String(body.title ?? "").replace(/\s+/g, " ").trim();

    if (requestedTitle.length > 100) {
      return NextResponse.json(
        { ok: false, message: "Snapshot titles must be 100 characters or less." },
        { status: 400 }
      );
    }

    const snapshot = await prisma.executiveReportSnapshot.create({
      data: {
        title: requestedTitle || defaultSnapshotTitle(live),
        range: live.range,
        periodStart: live.periodStart ? new Date(live.periodStart) : null,
        periodEnd: new Date(live.periodEnd),
        score: live.score,
        signal: live.signal,
        summary: live.summary,
        metricsJson: JSON.stringify(live.metrics),
        dimensionsJson: JSON.stringify(live.dimensions),
        evidenceJson: JSON.stringify(live.evidence),
        recommendationsJson: JSON.stringify(live.recommendations),
        createdBy: session.displayName,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        snapshot: toSnapshotDto(snapshot),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save executive report snapshot:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Morrow could not preserve this report snapshot.",
      },
      { status: 500 }
    );
  }
}
