import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      kpis,
      socialDrafts,
      assets,
      events,
      birthdays,
      aiDrafts,
      projects,
      newsItems,
    ] = await Promise.all([
      prisma.kpiItem.count(),
      prisma.socialDraft.count(),
      prisma.assetRecord.count(),
      prisma.globalEvent.count(),
      prisma.birthdayProfile.count(),
      prisma.aiDraft.count(),
      prisma.projectRecord.count(),
      prisma.newsItem.count(),
    ]);

    return NextResponse.json({
      ok: true,
      database: "connected",
      counts: {
        kpis,
        socialDrafts,
        assets,
        events,
        birthdays,
        aiDrafts,
        projects,
        newsItems,
      },
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: "Database connection failed.",
      },
      { status: 500 }
    );
  }
}