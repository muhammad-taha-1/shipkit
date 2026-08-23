import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Key, CreditCard, CalendarClock } from "lucide-react";

type StatsCardsProps = {
  memberCount: number;
  apiKeyCount: number;
  planName: string;
  daysUntilRenewal: number | null;
  trialDaysLeft: number | null;
};

export function StatsCards({
  memberCount,
  apiKeyCount,
  planName,
  daysUntilRenewal,
  trialDaysLeft,
}: StatsCardsProps) {
  const renewalLabel =
    trialDaysLeft !== null
      ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left`
      : daysUntilRenewal !== null
        ? `${daysUntilRenewal} day${daysUntilRenewal !== 1 ? "s" : ""}`
        : "—";
  const renewalDescription =
    trialDaysLeft !== null ? "Trial remaining" : "Until renewal";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Members"
        value={String(memberCount)}
        description="Team members"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="API Keys"
        value={String(apiKeyCount)}
        description="Active keys"
        icon={<Key className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Plan"
        value={planName}
        description="Current plan"
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title={renewalDescription}
        value={renewalLabel}
        description={renewalDescription}
        icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
