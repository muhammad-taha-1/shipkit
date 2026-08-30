"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Trash2, CheckCheck } from "lucide-react";
import { type NotificationType } from "@/generated/prisma/client";
import { notificationConfig } from "@/modules/notifications/types";
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/modules/notifications/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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

export function NotificationList({
  items,
  currentTab,
  nextCursor,
}: {
  items: NotificationItem[];
  currentTab: string;
  nextCursor: string | null;
}) {
  const router = useRouter();

  function handleTabChange(tab: string) {
    const params = new URLSearchParams();
    if (tab !== "all") params.set("tab", tab);
    const qs = params.toString();
    router.push(`/notifications${qs ? `?${qs}` : ""}`);
  }

  function handleLoadMore() {
    if (!nextCursor) return;
    const params = new URLSearchParams();
    if (currentTab !== "all") params.set("tab", currentTab);
    params.set("cursor", nextCursor);
    router.push(`/notifications?${params.toString()}`);
  }

  async function handleMarkRead(id: string) {
    const result = await markNotificationRead(id);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleMarkAllRead() {
    const result = await markAllNotificationsRead();
    if (result.success) {
      toast.success("All notifications marked as read");
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteNotification(id);
    if (result.success) {
      toast.success("Notification deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleClick(notification: NotificationItem) {
    if (!notification.read) {
      await markNotificationRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    router.refresh();
  }

  const tabs = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex h-8 items-center rounded-lg bg-muted p-[3px]">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                currentTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          className="text-xs"
        >
          <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
          Mark all read
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
          {currentTab === "unread"
            ? "No unread notifications."
            : "No notifications yet."}
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {items.map((notification) => {
            const config = notificationConfig[notification.type];
            const Icon = config.icon;
            const actorName =
              notification.actor?.name ??
              notification.actor?.email ??
              "System";

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 transition-colors ${
                  !notification.read ? "bg-accent/30" : ""
                }`}
              >
                <button
                  onClick={() => handleClick(notification)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <div className="relative mt-0.5 shrink-0">
                    <Avatar className="h-9 w-9">
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
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`}
                      />
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {notification.body}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(notification.createdAt)}
                      </span>
                      {notification.organization && (
                        <span className="text-xs text-muted-foreground">
                          &middot; {notification.organization.name}
                        </span>
                      )}
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  {!notification.read && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleMarkRead(notification.id)}
                          />
                        }
                      >
                        <Check className="h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent>Mark as read</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(notification.id)}
                        />
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
