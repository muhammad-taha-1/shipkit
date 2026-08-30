"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type NotificationType, type NotificationPreference } from "@/generated/prisma/client";
import { notificationConfig } from "@/modules/notifications/types";
import { updateNotificationPreference } from "@/modules/notifications/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const categories = [
  { key: "members" as const, title: "Members", description: "Notifications about team membership changes." },
  { key: "billing" as const, title: "Billing", description: "Notifications about subscription and payment events." },
];

export function NotificationPreferences({
  preferences,
}: {
  preferences: NotificationPreference[];
}) {
  const router = useRouter();
  const prefMap = new Map(preferences.map((p) => [p.type, p]));

  async function handleToggle(
    type: NotificationType,
    channel: "inApp" | "email",
    enabled: boolean,
  ) {
    const result = await updateNotificationPreference(type, channel, enabled);
    if (result.success) {
      router.refresh();
    } else {
      toast.error("Failed to update preference");
    }
  }

  const allTypes = Object.entries(notificationConfig) as [
    NotificationType,
    (typeof notificationConfig)[NotificationType],
  ][];

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const typesInCategory = allTypes.filter(
          ([, config]) => config.category === category.key,
        );

        return (
          <Card key={category.key}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-medium text-muted-foreground">
                    <th className="pb-2 text-left font-medium">Notification</th>
                    <th className="w-20 pb-2 text-center font-medium">In-app</th>
                    <th className="w-20 pb-2 text-center font-medium">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {typesInCategory.map(([type, config]) => {
                    const pref = prefMap.get(type);
                    const inAppEnabled = pref ? pref.inApp : config.defaultInApp;
                    const emailEnabled = pref ? pref.email : config.defaultEmail;

                    return (
                      <tr key={type}>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <config.icon
                              className={`h-4 w-4 shrink-0 ${config.color}`}
                            />
                            <span className="text-sm">{config.label}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              size="sm"
                              checked={inAppEnabled}
                              onCheckedChange={(checked) =>
                                handleToggle(type, "inApp", checked)
                              }
                            />
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              size="sm"
                              checked={emailEnabled}
                              onCheckedChange={(checked) =>
                                handleToggle(type, "email", checked)
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
