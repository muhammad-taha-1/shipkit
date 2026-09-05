"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { changeUserRole } from "@/modules/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
  _count: { memberships: number };
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UserList({
  users,
  currentUserId,
  search,
  nextCursor,
}: {
  users: UserItem[];
  currentUserId: string;
  search: string | null;
  nextCursor: string | null;
}) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [searchValue, setSearchValue] = useState(search ?? "");
  const [confirmState, setConfirmState] = useState<{
    userId: string;
    userName: string;
    newRole: string;
  } | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams();
        if (value) params.set("search", value);
        router.push(`/admin/users?${params.toString()}`);
      }, 300);
    },
    [router],
  );

  function handleLoadMore() {
    if (!nextCursor) return;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("cursor", nextCursor);
    router.push(`/admin/users?${params.toString()}`);
  }

  async function handleConfirmRoleChange() {
    if (!confirmState) return;
    const result = await changeUserRole(confirmState.userId, confirmState.newRole);
    if (result.success) {
      toast.success("User role updated");
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
          placeholder="Search by name or email..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Orgs</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const initials = user.name
                  ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                  : user.email[0].toUpperCase();
                const isCurrentUser = user.id === currentUserId;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {user.image && (
                            <AvatarImage src={user.image} alt={user.name ?? "Avatar"} />
                          )}
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {user.name ?? "Unnamed"}
                            {isCurrentUser && (
                              <span className="ml-1 text-muted-foreground">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCurrentUser ? (
                        <Badge variant="default">{user.role}</Badge>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(v) => {
                            if (v && v !== user.role) {
                              setConfirmState({
                                userId: user.id,
                                userName: user.name ?? user.email,
                                newRole: v,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.emailVerified ? "default" : "destructive"}>
                        {user.emailVerified ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user._count.memberships}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
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
        title="Change User Role"
        description={
          confirmState
            ? `Are you sure you want to change ${confirmState.userName}'s role to ${confirmState.newRole === "SUPER_ADMIN" ? "Super Admin" : "User"}?`
            : ""
        }
        confirmLabel="Change Role"
        variant="default"
        onConfirm={handleConfirmRoleChange}
      />
    </div>
  );
}
