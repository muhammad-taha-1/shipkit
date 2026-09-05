import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, Activity, LayoutDashboard } from "lucide-react";

export function AdminQuickLinks() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid gap-2">
          <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/admin/users" />}>
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/admin/organizations" />}>
            <Building2 className="mr-2 h-4 w-4" />
            Manage Organizations
          </Button>
          <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/admin/activity" />}>
            <Activity className="mr-2 h-4 w-4" />
            View Activity
          </Button>
          <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/dashboard" />}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
