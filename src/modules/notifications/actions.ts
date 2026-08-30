"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/modules/auth/guards";
import { type NotificationType } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(notificationId: string) {
  const user = await requireAuth();

  const notification = await db.notification.findUnique({
    where: { id: notificationId, recipientId: user.id },
  });
  if (!notification) {
    return { success: false, error: "Notification not found" };
  }

  await db.notification.update({
    where: { id: notificationId },
    data: { read: true, readAt: new Date() },
  });

  return { success: true };
}

export async function markAllNotificationsRead() {
  const user = await requireAuth();

  await db.notification.updateMany({
    where: { recipientId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  });

  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const user = await requireAuth();

  const notification = await db.notification.findUnique({
    where: { id: notificationId, recipientId: user.id },
  });
  if (!notification) {
    return { success: false, error: "Notification not found" };
  }

  await db.notification.delete({ where: { id: notificationId } });

  return { success: true };
}

export async function updateNotificationPreference(
  type: NotificationType,
  channel: "inApp" | "email",
  enabled: boolean,
) {
  const user = await requireAuth();

  await db.notificationPreference.upsert({
    where: {
      userId_type: { userId: user.id, type },
    },
    create: {
      userId: user.id,
      type,
      inApp: channel === "inApp" ? enabled : true,
      email: channel === "email" ? enabled : true,
    },
    update: {
      [channel]: enabled,
    },
  });

  revalidatePath("/settings/notifications");
  return { success: true };
}
