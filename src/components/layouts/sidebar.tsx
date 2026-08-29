"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "./org-switcher";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Activity,
  Key,
  User,
  FileText,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/files", label: "Files", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/members", label: "Members", icon: Users },
  { href: "/settings/api-keys", label: "API Keys", icon: Key },
];

type Org = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

export function Sidebar({
  orgs,
  activeOrgId,
}: {
  orgs: Org[];
  activeOrgId: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
      <div className="border-b p-3">
        <OrgSwitcher orgs={orgs} activeOrgId={activeOrgId} />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
