"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { type NotificationType } from "@/generated/prisma/client";
import { notificationConfig } from "@/modules/notifications/types";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/modules/notifications/actions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString();
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  const router = useRouter();

  async function handleMarkAllRead() {
    const result = await markAllNotificationsRead();
    if (result.success) {
      toast.success("All notifications marked as read");
      router.refresh();
    }
  }

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.read) {
      await markNotificationRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    router.refresh();
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative rounded-full" />
        }
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => {
              const config = notificationConfig[notification.type];
              const Icon = config.icon;
              const actorName =
                notification.actor?.name ??
                notification.actor?.email ??
                "System";

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                    !notification.read ? "bg-accent/30" : ""
                  }`}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <Avatar className="h-8 w-8">
                      {notification.actor?.image && (
                        <AvatarImage
                          src={notification.actor.image}
                          alt={actorName}
                        />
                      )}
                      <AvatarFallback className="text-xs">
                        {notification.actor
                          ? getInitials(
                              notification.actor.name,
                              notification.actor.email,
                            )
                          : "S"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      <Icon
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${config.color}`}
                      />
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.body}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 text-center">
              <Link
                href="/notifications"
                className="inline-block w-full rounded-md py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                View all notifications
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
