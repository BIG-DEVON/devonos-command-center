import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultSettings = {
  displayName: "Big Devon",
  roleTitle: "Communications Intelligence Lead",
  organization: "DevonOS",
  defaultTone: "Premium",
  defaultMode: "Work",
  signature: "Big Devon",
  brandDirection:
    "Premium white interface, soft platinum depth, deep ink text, blue-violet accents, champagne highlights, elegant spacing, and no green.",
  designRules:
    "Use clean negative space, refined typography, subtle glass effects, cinematic cards, soft shadows, and premium editorial layouts. Avoid clutter, fake logos, random data, and cheap AI-looking designs.",
  writingRules:
    "Write with clarity, confidence, polish, and structure. Keep official messages respectful, concise, and easy to understand.",
  postingRules:
    "Review captions before posting. Confirm sensitive details. Keep public communication accurate, calm, and professional.",
  systemNotes:
    "DevonOS is now connected to a local SQLite database through Prisma. Backend routes, saved modules, authentication, file uploads, and team access will be added progressively.",
};

async function getOrCreateSettings() {
  const existingSettings = await prisma.workspaceSettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingSettings) {
    return existingSettings;
  }

  return prisma.workspaceSettings.create({
    data: defaultSettings,
  });
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();

    return NextResponse.json({
      ok: true,
      settings,
    });
  } catch (error) {
    console.error("Failed to load settings:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load settings.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const existingSettings = await getOrCreateSettings();

    const updatedSettings = await prisma.workspaceSettings.update({
      where: {
        id: existingSettings.id,
      },
      data: {
        displayName: String(body.displayName ?? existingSettings.displayName),
        roleTitle: String(body.roleTitle ?? existingSettings.roleTitle),
        organization: String(body.organization ?? existingSettings.organization),
        defaultTone: String(body.defaultTone ?? existingSettings.defaultTone),
        defaultMode: String(body.defaultMode ?? existingSettings.defaultMode),
        signature: String(body.signature ?? existingSettings.signature),
        brandDirection: String(
          body.brandDirection ?? existingSettings.brandDirection
        ),
        designRules: String(body.designRules ?? existingSettings.designRules),
        writingRules: String(body.writingRules ?? existingSettings.writingRules),
        postingRules: String(body.postingRules ?? existingSettings.postingRules),
        systemNotes: String(body.systemNotes ?? existingSettings.systemNotes),
      },
    });

    return NextResponse.json({
      ok: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Failed to update settings:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update settings.",
      },
      { status: 500 }
    );
  }
}