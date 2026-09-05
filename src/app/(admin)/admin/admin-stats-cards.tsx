import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, DollarSign } from "lucide-react";

type AdminStatsCardsProps = {
  stats: {
    totalUsers: number;
    totalOrgs: number;
    activeSubscriptions: number;
    mrr: number;
  };
};

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={String(stats.totalUsers)}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Organizations"
        value={String(stats.totalOrgs)}
        icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Active Subscriptions"
        value={String(stats.activeSubscriptions)}
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="MRR"
        value={`$${(stats.mrr / 100).toFixed(2)}`}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
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
