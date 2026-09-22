import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

const modules = [
  "Social Studio",
  "AI Studio",
  "Assets",
  "Projects",
  "News Intelligence",
  "Reports",
  "General",
] as const;
const priorities = ["Critical", "High", "Medium", "Low"] as const;

function choice<T extends string>(
  value: unknown,
  choices: readonly T[],
  fallback: T
) {
  return typeof value === "string" && choices.includes(value as T)
    ? (value as T)
    : fallback;
}

function text(value: unknown, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function date(value: unknown) {
  const normalized = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

async function workspaceOwner() {
  const settings = await prisma.workspaceSettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  return settings?.displayName?.trim() || "Big Devon";
}

export async function GET() {
  try {
    const approvals = await prisma.approvalRequest.findMany({
      include: {
        activities: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: [
        {
          requestedAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      ok: true,
      approvals,
    });
  } catch (error) {
    console.error("Failed to load approvals:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Approvals could not be loaded.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = text(body.title, 180);

    if (!title) {
      return NextResponse.json(
        {
          ok: false,
          message: "An approval title is required.",
        },
        { status: 400 }
      );
    }

    const requestedBy = await workspaceOwner();
    const approver = text(body.approver, 120) || requestedBy;
    const moduleName = choice(body.module, modules, "General");
    const priority = choice(body.priority, priorities, "Medium");
    const summary = text(body.summary);
    const approval = await prisma.approvalRequest.create({
      data: {
        title,
        module: moduleName,
        sourceId: text(body.sourceId, 180),
        sourceLabel: text(body.sourceLabel, 240),
        sourceHref: text(body.sourceHref, 500),
        requestedBy,
        approver,
        priority,
        status: "Pending",
        dueDate: date(body.dueDate),
        summary,
        activities: {
          create: {
            action: "Requested",
            actor: requestedBy,
            detail: summary || `Approval requested from ${approver}.`,
          },
        },
      },
      include: {
        activities: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    await createNotification({
      title: `Approval requested: ${approval.title}`,
      message: `${approval.requestedBy} requested a decision from ${approval.approver}.`,
      category: "Approval",
      severity:
        approval.priority === "Critical" || approval.priority === "High"
          ? "warning"
          : "info",
      href: "/approvals",
      sourceType: "ApprovalRequest",
      sourceId: approval.id,
      dedupeKey: `approval-request:${approval.id}:pending`,
    });

    return NextResponse.json({
      ok: true,
      approval,
    });
  } catch (error) {
    console.error("Failed to create approval:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "The approval request could not be created.",
      },
      { status: 500 }
    );
  }
}
