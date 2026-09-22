import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      settings,
      newsItems,
      kpis,
      socialDrafts,
      assets,
      events,
      birthdays,
      aiDrafts,
      projects,
      autopilotTasks,
      approvals,
    ] = await Promise.all([
      prisma.workspaceSettings.findMany(),
      prisma.newsItem.findMany(),
      prisma.kpiItem.findMany(),
      prisma.socialDraft.findMany(),
      prisma.assetRecord.findMany(),
      prisma.globalEvent.findMany(),
      prisma.birthdayProfile.findMany(),
      prisma.aiDraft.findMany(),
      prisma.projectRecord.findMany(),
      prisma.autopilotTask.findMany(),
      prisma.approvalRequest.findMany({
        include: {
          activities: true,
        },
      }),
    ]);

    const generatedAt = new Date().toISOString();
    const backup = {
      product: "Morrow",
      formatVersion: 1,
      generatedAt,
      collections: {
        settings,
        newsItems,
        kpis,
        socialDrafts,
        assets,
        events,
        birthdays,
        aiDrafts,
        projects,
        autopilotTasks,
        approvals,
      },
    };
    const fileDate = generatedAt.slice(0, 10);

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="morrow-backup-${fileDate}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to create Morrow backup:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create backup.",
      },
      { status: 500 }
    );
  }
}
