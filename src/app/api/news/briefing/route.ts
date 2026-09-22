import { NextResponse } from "next/server";
import { buildNewsExecutiveBriefing } from "@/lib/news-briefing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const briefing = await buildNewsExecutiveBriefing();
    return NextResponse.json({ ok: true, briefing });
  } catch (error) {
    console.error("Failed to build News Intelligence briefing:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Morrow could not assemble the intelligence briefing.",
      },
      { status: 500 }
    );
  }
}
