import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.projectRecord.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      projects,
    });
  } catch (error) {
    console.error("Failed to load projects:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load projects.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const project = await prisma.projectRecord.create({
      data: {
        name: String(body.name ?? "").trim(),
        owner: String(body.owner ?? "").trim(),
        category: String(body.category ?? "General").trim(),
        status: String(body.status ?? "Planning"),
        priority: String(body.priority ?? "Medium"),
        startDate: String(body.startDate ?? ""),
        dueDate: String(body.dueDate ?? ""),
        objective: String(body.objective ?? "").trim(),
        deliverables: String(body.deliverables ?? "").trim(),
        notes: String(body.notes ?? "").trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      project,
    });
  } catch (error) {
    console.error("Failed to create project:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create project.",
      },
      { status: 500 }
    );
  }
}
