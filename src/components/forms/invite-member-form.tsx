"use client";

import { useActionState } from "react";
import { inviteMember } from "@/modules/members/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

type State = {
  errors: Record<string, string[]> | null;
};

export function InviteMemberForm({ orgId }: { orgId: string }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(
    _prevState: State,
    formData: FormData,
  ): Promise<State> {
    const result = await inviteMember(orgId, formData);
    if (result.success) {
      toast.success("Invitation sent");
      setOpen(false);
      return { errors: null };
    }
    return { errors: result.error as Record<string, string[]> };
  }

  const [state, action, isPending] = useActionState(handleSubmit, {
    errors: null,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="sm" />}
      >
        <Plus className="mr-2 h-4 w-4" />
        Invite member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            Send an email invitation to join your workspace.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="colleague@example.com"
              required
            />
            {state.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue="MEMBER">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send invitation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
