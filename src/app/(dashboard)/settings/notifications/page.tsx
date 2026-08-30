import type { Metadata } from "next";
import { requireAuth } from "@/modules/auth/guards";
import { getNotificationPreferences } from "@/modules/notifications/queries";
import { NotificationPreferences } from "./notification-preferences";

export const metadata: Metadata = {
  title: "Notification Preferences",
};

export default async function NotificationPreferencesPage() {
  const user = await requireAuth();
  const preferences = await getNotificationPreferences(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Notification Preferences
        </h1>
        <p className="text-muted-foreground">
          Choose how you want to be notified about activity in your workspace.
        </p>
      </div>
      <NotificationPreferences preferences={preferences} />
    </div>
  );
}
