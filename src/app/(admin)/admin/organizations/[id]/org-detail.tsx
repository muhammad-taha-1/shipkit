"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  deleteOrganization,
  changeOrgPlan,
} from "@/modules/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  Building2,
  Users,
  Activity,
  Key,
  FileIcon,
  HardDrive,
  CreditCard,
  Calendar,
  Ban,
  MailPlus,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { plans } from "@/modules/billing/plans";
import { type PlanType } from "@/generated/prisma/client";

type OrgDetailData = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  subscriptionStatus: string;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  members: {
    id: string;
    role: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: string;
      bannedAt: Date | null;
    };
  }[];
  _count: {
    files: number;
    apiKeys: number;
    invitations: number;
    auditLogs: number;
  };
  storageUsedBytes: number;
  recentActivity: {
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
  }[];
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAction(action: string): string {
  return action
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  TRIALING: "outline",
  PAST_DUE: "secondary",
  CANCELED: "destructive",
  UNPAID: "destructive",
  INCOMPLETE: "secondary",
};

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

export function OrgDetail({ org }: { org: OrgDetailData }) {
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  const planDef = plans[org.plan as PlanType];
  const storageLimit = planDef?.limits.maxStorageBytes ?? 0;

  async function handleDelete() {
    const result = await deleteOrganization(org.id);
    if (result.success) {
      toast.success("Organization deleted");
      router.push("/admin/organizations");
    } else {
      toast.error(result.error);
    }
  }

  async function handlePlanChange() {
    if (!pendingPlan) return;
    const result = await changeOrgPlan(org.id, pendingPlan);
    if (result.success) {
      toast.success("Plan updated");
      setPendingPlan(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/admin/organizations" />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Organization Details
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and manage organization.
          </p>
        </div>
      </div>

      {/* Org Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted">
              {org.logo ? (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-semibold">{org.name}</h2>
                <p className="text-muted-foreground">{org.slug}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <CreditCard className="mr-1 h-3 w-3" />
                  {org.plan}
                </Badge>
                <Badge
                  variant={
                    statusVariant[org.subscriptionStatus] ?? "secondary"
                  }
                >
                  {formatStatus(org.subscriptionStatus)}
                </Badge>
                {org.stripeCustomerId && (
                  <Badge variant="outline">Stripe Connected</Badge>
                )}
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {formatDate(org.createdAt)}
                </span>
                {org.trialEndsAt && (
                  <span>Trial ends {formatDate(org.trialEndsAt)}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Organization
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org.members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Files
            </CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org._count.files}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Keys
            </CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org._count.apiKeys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Invitations
            </CardTitle>
            <MailPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org._count.invitations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(org.storageUsedBytes)}
            </div>
            {storageLimit > 0 && storageLimit < Infinity && (
              <p className="text-xs text-muted-foreground">
                of {formatBytes(storageLimit)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Plan Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Select
                value={org.plan}
                onValueChange={(v) => {
                  if (v && v !== org.plan) {
                    setPendingPlan(v);
                    setPlanDialogOpen(true);
                  }
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {org.subscriptionId && (
              <p className="text-xs text-muted-foreground">
                Subscription: {org.subscriptionId}
              </p>
            )}
            {org.stripeCustomerId && (
              <p className="text-xs text-muted-foreground">
                Customer: {org.stripeCustomerId}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Members ({org.members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org.members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members.</p>
            ) : (
              <div className="space-y-3">
                {org.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {m.user.image && (
                        <AvatarImage
                          src={m.user.image}
                          alt={m.user.name ?? "Avatar"}
                        />
                      )}
                      <AvatarFallback className="text-xs">
                        {getUserInitials(m.user.name, m.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/users/${m.user.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {m.user.name ?? "Unnamed"}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.user.bannedAt && (
                        <Badge variant="destructive" className="text-xs">
                          <Ban className="mr-1 h-3 w-3" />
                          Banned
                        </Badge>
                      )}
                      <Badge variant="outline">{m.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {org.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.recentActivity.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.user ? (
                          <Link
                            href={`/admin/users/${item.user.id}`}
                            className="text-sm hover:underline"
                          >
                            {item.user.name ?? item.user.email}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            System
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatAction(item.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.entityType}
                        {item.entityId && (
                          <span className="ml-1 font-mono text-xs">
                            {item.entityId.slice(0, 8)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Organization"
        description={`Are you sure you want to permanently delete "${org.name}"? This will remove all members, files, API keys, and invitations. ${org.subscriptionId ? "Note: This does not cancel the Stripe subscription — you should cancel it separately." : ""} This action cannot be undone.`}
        confirmLabel="Delete Organization"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={planDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPlanDialogOpen(false);
            setPendingPlan(null);
          }
        }}
        title="Change Organization Plan"
        description={`Are you sure you want to change ${org.name}'s plan to ${pendingPlan}? This is an admin override and does not affect Stripe billing.`}
        confirmLabel="Change Plan"
        variant="default"
        onConfirm={handlePlanChange}
      />
    </div>
  );
}
