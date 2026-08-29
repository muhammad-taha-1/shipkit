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
import Image from "next/image";

type Org = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
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
        <span className="flex items-center gap-2 truncate">
          {activeOrg?.logo ? (
            <Image src={activeOrg.logo} alt="" width={20} height={20} className="shrink-0 rounded" />
          ) : (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold">
              {activeOrg?.name[0]?.toUpperCase()}
            </span>
          )}
          <span className="truncate font-semibold">{activeOrg?.name ?? "Select workspace"}</span>
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitch(org.id)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2 truncate">
              {org.logo ? (
                <Image src={org.logo} alt="" width={16} height={16} className="shrink-0 rounded" />
              ) : (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-[8px] font-bold">
                  {org.name[0]?.toUpperCase()}
                </span>
              )}
              <span className="truncate">{org.name}</span>
            </span>
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
