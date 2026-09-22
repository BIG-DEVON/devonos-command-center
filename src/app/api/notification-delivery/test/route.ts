import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dispatchPendingNotificationDeliveries,
  notificationProviderStatus,
  queueNotificationDeliveries,
  type DeliveryChannel,
} from "@/lib/notification-delivery";

const channels: DeliveryChannel[] = ["email", "sms", "push"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { channel?: unknown };
    if (typeof body.channel !== "string" || !channels.includes(body.channel as DeliveryChannel)) {
      return NextResponse.json(
        { ok: false, message: "Choose email, SMS, or web push." },
        { status: 400 }
      );
    }
    const channel = body.channel as DeliveryChannel;
    const [settings, deviceCount] = await Promise.all([
      prisma.workspaceSettings.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.pushSubscriptionRecord.count({ where: { enabled: true } }),
    ]);
    const provider = notificationProviderStatus()[channel];

    if (!provider.ready) {
      return NextResponse.json(
        {
          ok: false,
          message: `${provider.label} still needs its secure provider credentials.`,
          setupNeeded: provider.missing,
        },
        { status: 409 }
      );
    }
    if (channel === "email" && !settings?.notificationEmail) {
      return NextResponse.json(
        { ok: false, message: "Add and save a delivery email first." },
        { status: 409 }
      );
    }
    if (channel === "sms" && !settings?.notificationPhone) {
      return NextResponse.json(
        { ok: false, message: "Add and save an international phone number first." },
        { status: 409 }
      );
    }
    if (channel === "push" && deviceCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Register this browser as a push device first." },
        { status: 409 }
      );
    }

    const notification = await prisma.notificationRecord.create({
      data: {
        title: "Your Morrow signal is live.",
        message:
          channel === "email"
            ? "This polished email travelled through Morrow's tracked delivery outbox."
            : channel === "sms"
              ? "This phone alert travelled through Morrow's tracked delivery outbox."
              : "This device can now receive Morrow alerts even when the workspace is not open.",
        category: "Delivery test",
        severity: "info",
        href: "/settings?section=alerts",
        sourceType: "notification-test",
        sourceId: channel,
        status: "Unread",
      },
    });
    const queued = await queueNotificationDeliveries(notification.id, {
      channels: [channel],
      force: true,
    });
    const results = await dispatchPendingNotificationDeliveries({
      notificationId: notification.id,
      limit: 20,
    });
    const sent = results.some((result) => result.status === "Sent");

    return NextResponse.json(
      {
        ok: sent,
        message: sent
          ? `${provider.label} test delivered successfully.`
          : queued.length
            ? `${provider.label} accepted the test, but delivery did not complete.`
            : `No ${provider.label.toLowerCase()} destination was available.`,
        results,
      },
      { status: sent ? 200 : 502 }
    );
  } catch (error) {
    console.error("Notification test failed:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not complete that delivery test." },
      { status: 500 }
    );
  }
}
