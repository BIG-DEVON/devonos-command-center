import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notificationRecord.findMany({
        where: {
          status: {
            not: "Archived",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
      }),
      prisma.notificationRecord.count({
        where: {
          status: "Unread",
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to load notifications:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Notifications could not be loaded.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      markAllRead?: boolean;
      status?: "Unread" | "Read" | "Archived";
    };
    const readAt = new Date();

    if (body.markAllRead) {
      const result = await prisma.notificationRecord.updateMany({
        where: {
          status: "Unread",
        },
        data: {
          status: "Read",
          readAt,
        },
      });

      return NextResponse.json({
        ok: true,
        updated: result.count,
      });
    }

    if (!body.id || !["Unread", "Read", "Archived"].includes(body.status ?? "")) {
      return NextResponse.json(
        {
          ok: false,
          message: "A notification and valid status are required.",
        },
        { status: 400 }
      );
    }

    const status = body.status as "Unread" | "Read" | "Archived";
    const notification = await prisma.notificationRecord.update({
      where: {
        id: body.id,
      },
      data: {
        status,
        readAt: status === "Read" ? readAt : null,
      },
    });

    return NextResponse.json({
      ok: true,
      notification,
    });
  } catch (error) {
    console.error("Failed to update notification:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Notification could not be updated.",
      },
      { status: 500 }
    );
  }
}
