import "server-only";
import { db } from "@/lib/db";

const NOTIFICATION_ACTOR_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

const NOTIFICATION_ORG_SELECT = {
  id: true,
  name: true,
  slug: true,
} as const;

export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({
    where: { recipientId: userId, read: false },
  });
}

export async function getRecentNotifications(userId: string, limit = 10) {
  return db.notification.findMany({
    where: { recipientId: userId },
    include: {
      actor: { select: NOTIFICATION_ACTOR_SELECT },
      organization: { select: NOTIFICATION_ORG_SELECT },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNotifications({
  userId,
  unreadOnly,
  cursor,
  limit = 20,
}: {
  userId: string;
  unreadOnly?: boolean;
  cursor?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = { recipientId: userId };
  if (unreadOnly) where.read = false;

  const notifications = await db.notification.findMany({
    where,
    include: {
      actor: { select: NOTIFICATION_ACTOR_SELECT },
      organization: { select: NOTIFICATION_ORG_SELECT },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

export async function getNotificationPreferences(userId: string) {
  return db.notificationPreference.findMany({
    where: { userId },
  });
}
