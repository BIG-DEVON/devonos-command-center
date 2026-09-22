import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const statuses = [
  "Pending",
  "Approved",
  "Changes Requested",
  "Rejected",
  "Archived",
] as const;

function text(value: unknown, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const status =
      typeof body.status === "string" &&
      statuses.includes(body.status as (typeof statuses)[number])
        ? (body.status as (typeof statuses)[number])
        : null;

    if (!status) {
      return NextResponse.json(
        {
          ok: false,
          message: "A valid approval decision is required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.approvalRequest.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          message: "Approval request not found.",
        },
        { status: 404 }
      );
    }

    const settings = await prisma.workspaceSettings.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });
    const actor = settings?.displayName?.trim() || "Big Devon";
    const decisionNote = text(body.decisionNote);
    const decided =
      status === "Approved" ||
      status === "Changes Requested" ||
      status === "Rejected";
    const approval = await prisma.approvalRequest.update({
      where: {
        id,
      },
      data: {
        status,
        decisionNote:
          status === "Pending" ? "" : decisionNote || existing.decisionNote,
        decidedAt: decided ? new Date() : status === "Pending" ? null : undefined,
        activities: {
          create: {
            action: status,
            actor,
            detail:
              decisionNote ||
              (status === "Approved"
                ? "Approved without an additional note."
                : status === "Changes Requested"
                  ? "Changes requested without an additional note."
                  : status === "Rejected"
                    ? "Rejected without an additional note."
                    : status === "Archived"
                      ? "Approval archived."
                      : "Approval returned to Pending."),
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

    if (status !== "Pending") {
      await prisma.notificationRecord.updateMany({
        where: {
          sourceType: "ApprovalRequest",
          sourceId: approval.id,
          status: "Unread",
        },
        data: {
          status: "Archived",
        },
      });
    }

    if (decided) {
      await createNotification({
        title:
          status === "Approved"
            ? `Approved: ${approval.title}`
            : status === "Changes Requested"
              ? `Changes requested: ${approval.title}`
              : `Rejected: ${approval.title}`,
        message:
          decisionNote ||
          `${actor} recorded the decision in the Approval Center.`,
        category: "Approval",
        severity:
          status === "Approved"
            ? "success"
            : status === "Changes Requested"
              ? "warning"
              : "critical",
        href: "/approvals",
        sourceType: "ApprovalRequest",
        sourceId: approval.id,
        dedupeKey: `approval-decision:${approval.id}:${status}`,
      });
    }

    return NextResponse.json({
      ok: true,
      approval,
    });
  } catch (error) {
    console.error("Failed to update approval:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "The approval decision could not be saved.",
      },
      { status: 500 }
    );
  }
}
