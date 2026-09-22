import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  defaultSettings,
  devonModes,
  devonTimezones,
  devonTones,
} from "@/lib/devon-settings";

const settingsCreateData = {
  displayName: defaultSettings.displayName,
  roleTitle: defaultSettings.roleTitle,
  organization: defaultSettings.organization,
  defaultTone: defaultSettings.defaultTone,
  defaultMode: defaultSettings.defaultMode,
  signature: defaultSettings.signature,
  brandDirection: defaultSettings.brandDirection,
  designRules: defaultSettings.designRules,
  writingRules: defaultSettings.writingRules,
  postingRules: defaultSettings.postingRules,
  systemNotes: defaultSettings.systemNotes,
  theme: defaultSettings.theme,
  density: defaultSettings.density,
  motion: defaultSettings.motion,
  interfaceSounds: defaultSettings.interfaceSounds,
  soundVolume: defaultSettings.soundVolume,
  inAppNotifications: defaultSettings.inAppNotifications,
  browserNotifications: defaultSettings.browserNotifications,
  emailNotifications: defaultSettings.emailNotifications,
  smsNotifications: defaultSettings.smsNotifications,
  notificationEmail: defaultSettings.notificationEmail,
  notificationPhone: defaultSettings.notificationPhone,
  externalMinimumSeverity: defaultSettings.externalMinimumSeverity,
  quietHoursEnabled: defaultSettings.quietHoursEnabled,
  quietHoursStart: defaultSettings.quietHoursStart,
  quietHoursEnd: defaultSettings.quietHoursEnd,
  dailyBriefTime: defaultSettings.dailyBriefTime,
  timezone: defaultSettings.timezone,
  weekStartsOn: defaultSettings.weekStartsOn,
  confirmDestructiveTasks: defaultSettings.confirmDestructiveTasks,
};

function stringValue(value: unknown, fallback: string, max = 4000) {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, max);
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function choiceValue<T extends string>(
  value: unknown,
  choices: readonly T[],
  fallback: T
) {
  return typeof value === "string" && choices.includes(value as T)
    ? (value as T)
    : fallback;
}

function timeValue(value: unknown, fallback: string) {
  return typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    ? value
    : fallback;
}

function volumeValue(value: unknown, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

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
    data: settingsCreateData,
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
    const notificationEmail = stringValue(
      body.notificationEmail,
      existingSettings.notificationEmail,
      254
    ).toLowerCase();
    const notificationPhone = stringValue(
      body.notificationPhone,
      existingSettings.notificationPhone,
      18
    ).replace(/[\s()-]/g, "");

    if (
      notificationEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)
    ) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid notification email address." },
        { status: 400 }
      );
    }

    if (notificationPhone && !/^\+[1-9]\d{7,14}$/.test(notificationPhone)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Use an international phone number such as +2348012345678.",
        },
        { status: 400 }
      );
    }

    const updatedSettings = await prisma.workspaceSettings.update({
      where: {
        id: existingSettings.id,
      },
      data: {
        displayName: stringValue(
          body.displayName,
          existingSettings.displayName,
          120
        ),
        roleTitle: stringValue(body.roleTitle, existingSettings.roleTitle, 160),
        organization: stringValue(
          body.organization,
          existingSettings.organization,
          160
        ),
        defaultTone: choiceValue(
          body.defaultTone,
          devonTones,
          existingSettings.defaultTone as (typeof devonTones)[number]
        ),
        defaultMode: choiceValue(
          body.defaultMode,
          devonModes,
          existingSettings.defaultMode as (typeof devonModes)[number]
        ),
        signature: stringValue(body.signature, existingSettings.signature, 160),
        brandDirection: stringValue(
          body.brandDirection,
          existingSettings.brandDirection
        ),
        designRules: stringValue(
          body.designRules,
          existingSettings.designRules
        ),
        writingRules: stringValue(
          body.writingRules,
          existingSettings.writingRules
        ),
        postingRules: stringValue(
          body.postingRules,
          existingSettings.postingRules
        ),
        systemNotes: stringValue(
          body.systemNotes,
          existingSettings.systemNotes
        ),
        theme: choiceValue(
          body.theme,
          ["light", "dark", "system"] as const,
          existingSettings.theme as "light" | "dark" | "system"
        ),
        density: choiceValue(
          body.density,
          ["comfortable", "compact"] as const,
          existingSettings.density as "comfortable" | "compact"
        ),
        motion: choiceValue(
          body.motion,
          ["system", "full", "reduced"] as const,
          existingSettings.motion as "system" | "full" | "reduced"
        ),
        interfaceSounds: booleanValue(
          body.interfaceSounds,
          existingSettings.interfaceSounds
        ),
        soundVolume: volumeValue(
          body.soundVolume,
          existingSettings.soundVolume
        ),
        inAppNotifications: booleanValue(
          body.inAppNotifications,
          existingSettings.inAppNotifications
        ),
        browserNotifications: booleanValue(
          body.browserNotifications,
          existingSettings.browserNotifications
        ),
        emailNotifications: booleanValue(
          body.emailNotifications,
          existingSettings.emailNotifications
        ),
        smsNotifications: booleanValue(
          body.smsNotifications,
          existingSettings.smsNotifications
        ),
        notificationEmail,
        notificationPhone,
        externalMinimumSeverity: choiceValue(
          body.externalMinimumSeverity,
          ["info", "warning", "critical"] as const,
          existingSettings.externalMinimumSeverity as
            | "info"
            | "warning"
            | "critical"
        ),
        quietHoursEnabled: booleanValue(
          body.quietHoursEnabled,
          existingSettings.quietHoursEnabled
        ),
        quietHoursStart: timeValue(
          body.quietHoursStart,
          existingSettings.quietHoursStart
        ),
        quietHoursEnd: timeValue(
          body.quietHoursEnd,
          existingSettings.quietHoursEnd
        ),
        dailyBriefTime: timeValue(
          body.dailyBriefTime,
          existingSettings.dailyBriefTime
        ),
        timezone: choiceValue(
          body.timezone,
          devonTimezones.map((timezone) => timezone.value),
          existingSettings.timezone as (typeof devonTimezones)[number]["value"]
        ),
        weekStartsOn: choiceValue(
          body.weekStartsOn,
          ["monday", "sunday"] as const,
          existingSettings.weekStartsOn as "monday" | "sunday"
        ),
        confirmDestructiveTasks: booleanValue(
          body.confirmDestructiveTasks,
          existingSettings.confirmDestructiveTasks
        ),
      },
    });

    await prisma.automationSchedule.updateMany({
      where: {
        key: "daily-intelligence",
      },
      data: {
        time: updatedSettings.dailyBriefTime,
        timezone: updatedSettings.timezone,
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
