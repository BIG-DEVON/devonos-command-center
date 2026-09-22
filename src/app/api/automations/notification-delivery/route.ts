import { NextResponse } from "next/server";
import { scheduledRequestIsAuthorized } from "@/lib/automation-request";
import { dispatchPendingNotificationDeliveries } from "@/lib/notification-delivery";

async function runDeliveryWorker(request: Request) {
  if (!scheduledRequestIsAuthorized(request)) {
    return NextResponse.json(
      { ok: false, message: "Notification worker authorization failed." },
      { status: 401 }
    );
  }

  try {
    const results = await dispatchPendingNotificationDeliveries({ limit: 50 });
    return NextResponse.json({
      ok: true,
      processed: results.length,
      sent: results.filter((result) => result.status === "Sent").length,
    });
  } catch (error) {
    console.error("Scheduled notification delivery failed:", error);
    return NextResponse.json(
      { ok: false, message: "The notification worker did not complete." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return runDeliveryWorker(request);
}

export async function POST(request: Request) {
  return runDeliveryWorker(request);
}
