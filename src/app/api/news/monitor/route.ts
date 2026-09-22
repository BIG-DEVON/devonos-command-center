import { NextResponse } from "next/server";
import { NEWS_SOURCES, runNewsMonitor } from "@/lib/news-intelligence";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [sourceStates, runs] = await Promise.all([
      prisma.newsSourceState.findMany(),
      prisma.newsMonitorRun.findMany({
        orderBy: {
          startedAt: "desc",
        },
        take: 12,
      }),
    ]);
    const sourceStateByKey = new Map(
      sourceStates.map((source) => [source.key, source])
    );

    return NextResponse.json({
      ok: true,
      sources: NEWS_SOURCES.map((definition) => {
        const state = sourceStateByKey.get(definition.key);
        return {
          ...definition,
          enabled: state?.enabled ?? true,
          lastCheckedAt: state?.lastCheckedAt ?? null,
          lastSuccessfulAt: state?.lastSuccessfulAt ?? null,
          lastStatus: state?.lastStatus ?? "Ready",
          lastError: state?.lastError ?? "",
          itemsSeen: state?.itemsSeen ?? 0,
        };
      }),
      runs,
    });
  } catch (error) {
    console.error("Failed to load news monitor:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "The monitoring status could not be loaded.",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await runNewsMonitor();

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to run news monitor:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "The monitoring run could not be completed.",
      },
      { status: 500 }
    );
  }
}
