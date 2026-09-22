import { prisma } from "@/lib/prisma";
import {
  dispatchPendingNotificationDeliveries,
  queueNotificationDeliveries,
} from "@/lib/notification-delivery";

type CreateNotificationInput = {
  title: string;
  message: string;
  category?: string;
  severity?: "info" | "success" | "warning" | "critical";
  href?: string;
  sourceType?: string;
  sourceId?: string;
  dedupeKey?: string;
  reopenOnUpdate?: boolean;
};

export async function createNotification({
  title,
  message,
  category = "System",
  severity = "info",
  href = "",
  sourceType = "",
  sourceId = "",
  dedupeKey,
  reopenOnUpdate = true,
}: CreateNotificationInput) {
  const content = {
    title,
    message,
    category,
    severity,
    href,
    sourceType,
    sourceId,
  };
  const unreadState = {
    status: "Unread",
    readAt: null,
  };

  const notification = dedupeKey
    ? await prisma.notificationRecord.upsert({
      where: {
        dedupeKey,
      },
      update: reopenOnUpdate
        ? {
            ...content,
            ...unreadState,
          }
        : content,
      create: {
        ...content,
        ...unreadState,
        dedupeKey,
      },
    })
    : await prisma.notificationRecord.create({
        data: {
          ...content,
          ...unreadState,
        },
      });

  try {
    await queueNotificationDeliveries(notification.id);
    await dispatchPendingNotificationDeliveries({
      notificationId: notification.id,
      limit: 10,
    });
  } catch (error) {
    console.error("Notification was saved, but delivery preparation failed:", error);
  }

  return notification;
}
