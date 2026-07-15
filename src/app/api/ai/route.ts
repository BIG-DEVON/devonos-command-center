import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const drafts = await prisma.aiDraft.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      drafts,
    });
  } catch (error) {
    console.error("Failed to load AI drafts:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load AI drafts.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const draft = await prisma.aiDraft.create({
      data: {
        title: String(body.title ?? "").trim(),
        category: String(body.category ?? "Caption"),
        tone: String(body.tone ?? "Premium"),
        status: String(body.status ?? "Draft"),
        instruction: String(body.instruction ?? "").trim(),
        sourceText: String(body.sourceText ?? "").trim(),
        output: String(body.output ?? "").trim(),
        notes: String(body.notes ?? "").trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      draft,
    });
  } catch (error) {
    console.error("Failed to create AI draft:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create AI draft.",
      },
      { status: 500 }
    );
  }
}
