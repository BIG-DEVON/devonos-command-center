import { NextResponse } from "next/server";
import {
  collectOperationalAlerts,
  scanOperationalAlerts,
} from "@/lib/operational-alerts";

export async function GET() {
  try {
    const result = await collectOperationalAlerts();
    const categories = result.alerts.reduce<Record<string, number>>(
      (counts, alert) => {
        counts[alert.category] = (counts[alert.category] ?? 0) + 1;
        return counts;
      },
      {}
    );

    return NextResponse.json({
      ok: true,
      alerts: result.alerts,
      counts: {
        active: result.alerts.length,
        critical: result.alerts.filter(
          (alert) => alert.severity === "critical"
        ).length,
        warning: result.alerts.filter(
          (alert) => alert.severity === "warning"
        ).length,
        categories,
      },
      today: result.today,
      timeZone: result.timeZone,
    });
  } catch (error) {
    console.error("Failed to preview operational alerts:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Operational alerts could not be evaluated.",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await scanOperationalAlerts();

    return NextResponse.json({
      ok: true,
      ...result,
      message: result.counts.active
        ? `${result.counts.active} active operational alert${
            result.counts.active === 1 ? "" : "s"
          } checked. ${result.counts.created} new notification${
            result.counts.created === 1 ? "" : "s"
          } created.`
        : "No operational alerts need attention right now.",
    });
  } catch (error) {
    console.error("Operational alert scan failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Operational alerts could not be scanned.",
      },
      { status: 500 }
    );
  }
}
