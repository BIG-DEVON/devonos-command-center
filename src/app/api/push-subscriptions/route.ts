import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationProviderStatus } from "@/lib/notification-delivery";

type PushSubscriptionBody = {
  endpoint?: unknown;
  expirationTime?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
  deviceLabel?: unknown;
};

function validHttpsEndpoint(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const status = notificationProviderStatus();
    const deviceCount = await prisma.pushSubscriptionRecord.count({
      where: { enabled: true },
    });
    return NextResponse.json({
      ok: true,
      ready: status.push.ready,
      publicVapidKey: status.publicVapidKey,
      deviceCount,
    });
  } catch (error) {
    console.error("Failed to load push subscription status:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not load push status." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSubscriptionBody;
    const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
    const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh.trim() : "";
    const auth = typeof body.keys?.auth === "string" ? body.keys.auth.trim() : "";
    const deviceLabel =
      typeof body.deviceLabel === "string" && body.deviceLabel.trim()
        ? body.deviceLabel.trim().slice(0, 100)
        : "Browser device";

    if (
      !validHttpsEndpoint(endpoint) ||
      endpoint.length > 2048 ||
      p256dh.length < 20 ||
      p256dh.length > 512 ||
      auth.length < 8 ||
      auth.length > 256
    ) {
      return NextResponse.json(
        { ok: false, message: "That browser push subscription is invalid." },
        { status: 400 }
      );
    }

    const subscription = await prisma.pushSubscriptionRecord.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth,
        userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "",
        deviceLabel,
        enabled: true,
        lastSeenAt: new Date(),
      },
      create: {
        endpoint,
        p256dh,
        auth,
        userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "",
        deviceLabel,
      },
    });
    return NextResponse.json({ ok: true, id: subscription.id });
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not register this device." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { endpoint?: unknown };
    const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
    if (!endpoint) {
      return NextResponse.json(
        { ok: false, message: "A push endpoint is required." },
        { status: 400 }
      );
    }
    await prisma.pushSubscriptionRecord.updateMany({
      where: { endpoint },
      data: { enabled: false },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to disable push subscription:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not remove this device." },
      { status: 500 }
    );
  }
}
