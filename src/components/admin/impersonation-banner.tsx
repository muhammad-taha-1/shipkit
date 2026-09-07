"use client";

import { useRouter } from "next/navigation";
import { stopImpersonation } from "@/modules/admin/actions";
import { Button } from "@/components/ui/button";
import { UserCog, X } from "lucide-react";
import { toast } from "sonner";

export function ImpersonationBanner({
  userName,
  userEmail,
}: {
  userName: string | null;
  userEmail: string;
}) {
  const router = useRouter();

  async function handleStop() {
    const result = await stopImpersonation();
    if (result.success) {
      toast.success("Stopped impersonating");
      router.push("/admin/users");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4" />
        <span>
          Impersonating <strong>{userName ?? userEmail}</strong>
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStop}
        className="h-7 gap-1.5 text-amber-950 hover:bg-amber-600 hover:text-amber-950"
      >
        <X className="h-3.5 w-3.5" />
        Stop
      </Button>
    </div>
  );
}
