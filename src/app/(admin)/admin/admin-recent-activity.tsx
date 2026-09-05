import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  Building2,
  UserPlus,
  UserMinus,
  ShieldCheck,
  CreditCard,
  Key,
  MailX,
  Settings,
} from "lucide-react";

type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: Date;
  user: {
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

const actionConfig: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  "org.created": { icon: Building2, label: "created an organization", color: "text-blue-500" },
  "org.updated": { icon: Settings, label: "updated organization settings", color: "text-gray-500" },
  "org.deleted": { icon: Building2, label: "deleted an organization", color: "text-red-500" },
  "member.invited": { icon: UserPlus, label: "invited a member", color: "text-green-500" },
  "member.joined": { icon: UserPlus, label: "joined a team", color: "text-green-500" },
  "member.removed": { icon: UserMinus, label: "removed a member", color: "text-red-500" },
  "member.role_changed": { icon: ShieldCheck, label: "changed a member's role", color: "text-yellow-500" },
  "invitation.revoked": { icon: MailX, label: "revoked an invitation", color: "text-orange-500" },
  "billing.checkout": { icon: CreditCard, label: "started checkout", color: "text-purple-500" },
  "billing.subscription_created": { icon: CreditCard, label: "activated a subscription", color: "text-green-500" },
  "billing.subscription_updated": { icon: CreditCard, label: "updated a subscription", color: "text-blue-500" },
  "billing.subscription_canceled": { icon: CreditCard, label: "canceled a subscription", color: "text-red-500" },
  "billing.subscription_resumed": { icon: CreditCard, label: "resumed a subscription", color: "text-green-500" },
  "apikey.created": { icon: Key, label: "created an API key", color: "text-blue-500" },
  "apikey.revoked": { icon: Key, label: "revoked an API key", color: "text-red-500" },
  "admin.user_role_changed": { icon: ShieldCheck, label: "changed a user's role", color: "text-yellow-500" },
  "admin.org_plan_changed": { icon: CreditCard, label: "changed an org's plan", color: "text-purple-500" },
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

function getUserInitials(name: string | null, email: string): string {
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

export function AdminRecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardAction>
          <Link
            href="/admin/activity"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const config = actionConfig[item.action] ?? {
                icon: Settings,
                label: item.action,
                color: "text-gray-500",
              };
              const Icon = config.icon;
              const userName =
                item.user?.name ?? item.user?.email ?? "System";

              return (
                <div key={item.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {item.user
                        ? getUserInitials(item.user.name, item.user.email)
                        : "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm">
                      <span className="font-medium">{userName}</span>{" "}
                      <span className="text-muted-foreground">
                        {config.label}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.organization && (
                        <span className="mr-1">{item.organization.name} ·</span>
                      )}
                      {getRelativeTime(item.createdAt)}
                    </p>
                  </div>
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
