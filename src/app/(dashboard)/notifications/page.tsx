import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/guards";
import { getNotifications } from "@/modules/notifications/queries";
import { NotificationList } from "./notification-list";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; cursor?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const unreadOnly = params.tab === "unread";
  const { items, nextCursor } = await getNotifications({
    userId: user.id,
    unreadOnly,
    cursor: params.cursor,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-muted-foreground">
          Stay up to date with what is happening in your workspace.
        </p>
      </div>
      <NotificationList
        items={items}
        currentTab={params.tab ?? "all"}
        nextCursor={nextCursor}
      />
    </div>
  );
}
