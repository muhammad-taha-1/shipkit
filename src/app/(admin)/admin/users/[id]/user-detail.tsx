"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  banUser,
  unbanUser,
  deleteUser,
  startImpersonation,
  changeUserRole,
} from "@/modules/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Ban,
  CheckCircle,
  Trash2,
  UserCog,
  Shield,
  Building2,
  Activity,
  Key,
  FileIcon,
  Bell,
  Mail,
  Calendar,
  Settings,
} from "lucide-react";

type UserDetailData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  bannedAt: Date | null;
  bannedReason: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  accounts: { provider: string }[];
  memberships: {
    role: string;
    createdAt: Date;
    organization: {
      id: string;
      name: string;
      slug: string;
      plan: string;
      subscriptionStatus: string;
    };
  }[];
  _count: {
    auditLogs: number;
    files: number;
    apiKeys: number;
    notificationsReceived: number;
  };
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    metadata: unknown;
    createdAt: Date;
    organization: { id: string; name: string; slug: string } | null;
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

export function UserDetail({
  user,
  currentAdminId,
}: {
  user: UserDetailData;
  currentAdminId: string;
}) {
  const router = useRouter();
  const isCurrentUser = user.id === currentAdminId;
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isBanned = !!user.bannedAt;

  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  async function handleBan() {
    const result = await banUser(user.id, banReason || undefined);
    if (result.success) {
      toast.success("User banned");
      setBanReason("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleUnban() {
    const result = await unbanUser(user.id);
    if (result.success) {
      toast.success("User unbanned");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    const result = await deleteUser(user.id);
    if (result.success) {
      toast.success("User deleted");
      router.push("/admin/users");
    } else {
      toast.error(result.error);
    }
  }

  async function handleImpersonate() {
    const result = await startImpersonation(user.id);
    if (result.success) {
      toast.success(`Now impersonating ${user.name ?? user.email}`);
      router.push("/dashboard");
    } else {
      toast.error(result.error);
    }
  }

  async function handleRoleChange() {
    if (!pendingRole) return;
    const result = await changeUserRole(user.id, pendingRole);
    if (result.success) {
      toast.success("Role updated");
      setPendingRole(null);
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
          render={<Link href="/admin/users" />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage user account.
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <Avatar className="h-20 w-20">
              {user.image && (
                <AvatarImage src={user.image} alt={user.name ?? "Avatar"} />
              )}
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {user.name ?? "Unnamed User"}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={isSuperAdmin ? "default" : "secondary"}>
                  <Shield className="mr-1 h-3 w-3" />
                  {user.role === "SUPER_ADMIN" ? "Super Admin" : "User"}
                </Badge>
                {isBanned && (
                  <Badge variant="destructive">
                    <Ban className="mr-1 h-3 w-3" />
                    Banned
                  </Badge>
                )}
                <Badge
                  variant={user.emailVerified ? "default" : "destructive"}
                >
                  <Mail className="mr-1 h-3 w-3" />
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
                {user.accounts.map((account) => (
                  <Badge key={account.provider} variant="outline">
                    {account.provider.charAt(0).toUpperCase() +
                      account.provider.slice(1)}
                  </Badge>
                ))}
              </div>

              {isBanned && user.bannedReason && (
                <p className="text-sm text-destructive">
                  Ban reason: {user.bannedReason}
                </p>
              )}

              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            {!isCurrentUser && (
              <div className="flex flex-col gap-2 sm:items-end">
                {!isSuperAdmin && !isBanned && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImpersonateDialogOpen(true)}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Impersonate
                  </Button>
                )}
                {!isSuperAdmin && (
                  <>
                    {isBanned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUnbanDialogOpen(true)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Unban User
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBanDialogOpen(true)}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.memberships.length}</div>
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
            <div className="text-2xl font-bold">{user._count.apiKeys}</div>
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
            <div className="text-2xl font-bold">{user._count.files}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user._count.notificationsReceived}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role Management */}
        {!isCurrentUser && !isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Role Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Select
                  value={user.role}
                  onValueChange={(v) => {
                    if (v && v !== user.role) {
                      setPendingRole(v);
                      setRoleDialogOpen(true);
                    }
                  }}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizations */}
        <Card className={!isCurrentUser && !isSuperAdmin ? "" : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Organizations ({user.memberships.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not a member of any organization.
              </p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.memberships.map((m) => (
                      <TableRow key={m.organization.id}>
                        <TableCell>
                          <Link
                            href={`/admin/organizations/${m.organization.id}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {m.organization.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {m.organization.slug}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {m.organization.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              statusVariant[m.organization.subscriptionStatus] ??
                              "secondary"
                            }
                          >
                            {formatStatus(m.organization.subscriptionStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDate(m.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
          {user.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.recentActivity.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatAction(item.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.organization ? (
                          <Link
                            href={`/admin/organizations/${item.organization.id}`}
                            className="hover:underline"
                          >
                            {item.organization.name}
                          </Link>
                        ) : (
                          "—"
                        )}
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
        open={banDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setBanDialogOpen(false);
            setBanReason("");
          }
        }}
        title="Ban User"
        description={`Are you sure you want to ban ${user.name ?? user.email}? They will be unable to log in.`}
        confirmLabel="Ban User"
        variant="destructive"
        onConfirm={handleBan}
      >
        <div className="space-y-2 pt-2">
          <Label htmlFor="ban-reason">Reason (optional)</Label>
          <Input
            id="ban-reason"
            placeholder="Reason for banning..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={unbanDialogOpen}
        onOpenChange={setUnbanDialogOpen}
        title="Unban User"
        description={`Are you sure you want to unban ${user.name ?? user.email}? They will be able to log in again.`}
        confirmLabel="Unban User"
        variant="default"
        onConfirm={handleUnban}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to permanently delete ${user.name ?? user.email}? This will remove all their data including memberships, API keys, and files. This action cannot be undone.`}
        confirmLabel="Delete User"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
        title="Impersonate User"
        description={`You will be signed in as ${user.name ?? user.email}. You'll see the app from their perspective. Use the banner at the top to stop impersonating.`}
        confirmLabel="Start Impersonating"
        variant="default"
        onConfirm={handleImpersonate}
      />

      <ConfirmDialog
        open={roleDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRoleDialogOpen(false);
            setPendingRole(null);
          }
        }}
        title="Change User Role"
        description={`Are you sure you want to change ${user.name ?? user.email}'s role to ${pendingRole === "SUPER_ADMIN" ? "Super Admin" : "User"}?`}
        confirmLabel="Change Role"
        variant="default"
        onConfirm={handleRoleChange}
      />
    </div>
  );
}
