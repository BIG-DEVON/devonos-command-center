import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assets = await prisma.assetRecord.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      assets,
    });
  } catch (error) {
    console.error("Failed to load assets:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load assets.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const asset = await prisma.assetRecord.create({
      data: {
        name: String(body.name ?? "").trim(),
        type: String(body.type ?? "Document"),
        project: String(body.project ?? "").trim(),
        status: String(body.status ?? "Raw"),
        priority: String(body.priority ?? "Medium"),
        link: String(body.link ?? "").trim(),
        tags: String(body.tags ?? "").trim(),
        notes: String(body.notes ?? "").trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      asset,
    });
  } catch (error) {
    console.error("Failed to create asset:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create asset.",
      },
      { status: 500 }
    );
  }
}