import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Key, CreditCard, Settings } from "lucide-react";

export function QuickActions() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid gap-2">
          <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/settings/members" />}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
          <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/settings/api-keys" />}>
            <Key className="mr-2 h-4 w-4" />
            Manage API Keys
          </Button>
          <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/billing" />}>
            <CreditCard className="mr-2 h-4 w-4" />
            View Billing
          </Button>
          <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/settings" />}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
