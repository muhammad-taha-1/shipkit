"use client";

import { useRouter } from "next/navigation";
import { removeMember, changeRole, revokeInvitation } from "@/modules/members/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { toast } from "sonner";
import { X } from "lucide-react";
import { type MemberRole } from "@/generated/prisma/client";

type Member = {
  id: string;
  role: MemberRole;
  user: { id: string; name: string | null; email: string; image: string | null };
};

type Invitation = {
  id: string;
  email: string;
  role: MemberRole;
  invitedBy: { name: string | null; email: string };
};

export function MemberList({
  members,
  invitations,
  currentUserId,
  orgId,
}: {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
  orgId: string;
}) {
  const router = useRouter();

  async function handleRemove(userId: string) {
    const result = await removeMember(orgId, userId);
    if (result.success) {
      toast.success("Member removed");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    const result = await changeRole(orgId, userId, role as MemberRole);
    if (result.success) {
      toast.success("Role updated");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRevoke(invitationId: string) {
    const result = await revokeInvitation(invitationId, orgId);
    if (result.success) {
      toast.success("Invitation revoked");
      router.refresh();
    } else {
      toast.error("Failed to revoke invitation");
    }
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const initials = member.user.name
              ? member.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              : member.user.email[0].toUpperCase();
            const isCurrentUser = member.user.id === currentUserId;
            const isOwner = member.role === "OWNER";

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.user.name ?? "Unnamed"}
                        {isCurrentUser && (
                          <span className="ml-1 text-muted-foreground">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {isOwner || isCurrentUser ? (
                    <Badge variant={isOwner ? "default" : "secondary"}>
                      {member.role}
                    </Badge>
                  ) : (
                    <Select
                      defaultValue={member.role}
                      onValueChange={(v) => { if (v) handleRoleChange(member.user.id, v); }}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {!isOwner && !isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(member.user.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {invitations.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Pending invitations
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm">{inv.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{inv.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { handleRevoke(inv.id); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
