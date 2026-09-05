"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { changeOrgPlan } from "@/modules/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Search } from "lucide-react";

type OrgItem = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscriptionStatus: string;
  createdAt: Date;
  _count: { members: number };
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  TRIALING: "outline",
  PAST_DUE: "secondary",
  CANCELED: "destructive",
  UNPAID: "destructive",
  INCOMPLETE: "secondary",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrgList({
  orgs,
  search,
  nextCursor,
}: {
  orgs: OrgItem[];
  search: string | null;
  nextCursor: string | null;
}) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [searchValue, setSearchValue] = useState(search ?? "");
  const [confirmState, setConfirmState] = useState<{
    orgId: string;
    orgName: string;
    newPlan: string;
  } | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams();
        if (value) params.set("search", value);
        router.push(`/admin/organizations?${params.toString()}`);
      }, 300);
    },
    [router],
  );

  function handleLoadMore() {
    if (!nextCursor) return;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("cursor", nextCursor);
    router.push(`/admin/organizations?${params.toString()}`);
  }

  async function handleConfirmPlanChange() {
    if (!confirmState) return;
    const result = await changeOrgPlan(confirmState.orgId, confirmState.newPlan);
    if (result.success) {
      toast.success("Organization plan updated");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or slug..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {orgs.length === 0 ? (
        <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
          No organizations found.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={org.plan}
                      onValueChange={(v) => {
                        if (v && v !== org.plan) {
                          setConfirmState({
                            orgId: org.id,
                            orgName: org.name,
                            newPlan: v,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free</SelectItem>
                        <SelectItem value="PRO">Pro</SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[org.subscriptionStatus] ?? "secondary"}>
                      {formatStatus(org.subscriptionStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{org._count.members}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(org.createdAt)}
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

      <ConfirmDialog
        open={confirmState !== null}
        onOpenChange={(open) => { if (!open) setConfirmState(null); }}
        title="Change Organization Plan"
        description={
          confirmState
            ? `Are you sure you want to change ${confirmState.orgName}'s plan to ${confirmState.newPlan}? This is an admin override and does not affect Stripe billing.`
            : ""
        }
        confirmLabel="Change Plan"
        variant="default"
        onConfirm={handleConfirmPlanChange}
      />
    </div>
  );
}
