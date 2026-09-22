import { NextResponse } from "next/server";
import { dispatchPendingNotificationDeliveries } from "@/lib/notification-delivery";

export async function POST() {
  try {
    const results = await dispatchPendingNotificationDeliveries({ limit: 50 });
    return NextResponse.json({
      ok: true,
      processed: results.length,
      sent: results.filter((result) => result.status === "Sent").length,
      results,
    });
  } catch (error) {
    console.error("Notification delivery dispatch failed:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not process pending deliveries." },
      { status: 500 }
    );
  }
}
