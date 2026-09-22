import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  notificationProviderStatus,
  redactDestination,
} from "@/lib/notification-delivery";
import { nextAutomationRun } from "@/lib/automations";

export async function GET() {
  try {
    const [settings, deviceCount, deliveries, schedule] = await Promise.all([
      prisma.workspaceSettings.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.pushSubscriptionRecord.count({ where: { enabled: true } }),
      prisma.notificationDelivery.findMany({
        include: {
          notification: { select: { title: true, severity: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.automationSchedule.findUnique({
        where: { key: "daily-intelligence" },
      }),
    ]);
    const providerStatus = notificationProviderStatus();
    const automationSecretReady = Boolean(
      process.env.MORROW_AUTOMATION_SECRET?.trim() ||
        process.env.DEVONOS_AUTOMATION_SECRET?.trim() ||
        process.env.CRON_SECRET?.trim()
    );
    const sweepTime = schedule?.time || settings?.dailyBriefTime || "07:30";
    const sweepTimezone = schedule?.timezone || settings?.timezone || "Africa/Lagos";

    return NextResponse.json({
      ok: true,
      providers: providerStatus.providers.map((provider) => ({
        channel: provider.channel,
        label: provider.label,
        provider: provider.provider,
        ready: provider.ready,
        setupNeeded: provider.missing,
      })),
      publicVapidKey: providerStatus.publicVapidKey,
      deviceCount,
      automation: {
        enabled: schedule?.enabled ?? true,
        secured: automationSecretReady,
        time: sweepTime,
        timezone: sweepTimezone,
        nextRunAt:
          schedule?.enabled === false
            ? null
            : nextAutomationRun(sweepTime, sweepTimezone).toISOString(),
        reminderDays: [14, 7, 3, 1, 0],
      },
      destinations: {
        email: Boolean(settings?.notificationEmail),
        sms: Boolean(settings?.notificationPhone),
      },
      deliveries: deliveries.map((delivery) => ({
        id: delivery.id,
        channel: delivery.channel,
        provider: delivery.provider,
        status: delivery.status,
        destination: redactDestination(delivery.channel, delivery.destination),
        title: delivery.notification.title,
        severity: delivery.notification.severity,
        attempts: delivery.attemptCount,
        error: delivery.lastError,
        sentAt: delivery.sentAt?.toISOString() ?? null,
        createdAt: delivery.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to load notification delivery status:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not load delivery status." },
      { status: 500 }
    );
  }
}
