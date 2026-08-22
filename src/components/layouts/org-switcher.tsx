"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { switchOrganization } from "@/modules/organizations/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus, Check } from "lucide-react";

type Org = {
  id: string;
  name: string;
  slug: string;
};

export function OrgSwitcher({
  orgs,
  activeOrgId,
}: {
  orgs: Org[];
  activeOrgId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? orgs[0];

  async function handleSwitch(orgId: string) {
    await switchOrganization(orgId);
    setOpen(false);
    router.refresh();
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="w-full justify-between px-3" />}
      >
        <span className="truncate font-semibold">{activeOrg?.name ?? "Select workspace"}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitch(org.id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{org.name}</span>
            {org.id === activeOrgId && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/onboarding")}>
          <Plus className="mr-2 h-4 w-4" />
          Create new workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
