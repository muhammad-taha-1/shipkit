"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrganization } from "@/modules/organizations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

export function DangerZone({
  orgId,
  orgName,
}: {
  orgId: string;
  orgName: string;
}) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const canDelete = confirmation === orgName;

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteOrganization(orgId);
    if (result.success) {
      toast.success("Organization deleted.");
      router.push("/onboarding");
      router.refresh();
    } else {
      toast.error(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete this organization and all of its data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirmation(""); }}>
          <DialogTrigger render={<Button variant="destructive" />}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete organization
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete organization</DialogTitle>
              <DialogDescription>
                This action cannot be undone. All members, API keys, and data
                will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-semibold">{orgName}</span> to
                confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={orgName}
              />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={!canDelete || isDeleting}
                onClick={handleDelete}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete forever
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
