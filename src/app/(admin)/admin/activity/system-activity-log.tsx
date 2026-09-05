"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type AuditItem = {
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

function formatDate(date: Date): string {
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

export function SystemActivityLog({
  items,
  actions,
  currentAction,
  nextCursor,
}: {
  items: AuditItem[];
  actions: string[];
  currentAction: string | null;
  nextCursor: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilterChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete("action");
    } else {
      params.set("action", value);
    }
    params.delete("cursor");
    router.push(`/admin/activity?${params.toString()}`);
  }

  function handleLoadMore() {
    if (!nextCursor) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", nextCursor);
    router.push(`/admin/activity?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={currentAction ?? "all"}
          onValueChange={handleFilterChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>
                {formatAction(action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
          No activity found.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {item.user
                            ? getUserInitials(item.user.name, item.user.email)
                            : "S"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {item.user?.name ?? item.user?.email ?? "System"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatAction(item.action)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.organization?.name ?? "—"}
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
                    {formatDate(item.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
