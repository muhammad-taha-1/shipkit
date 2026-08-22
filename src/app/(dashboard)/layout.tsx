import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/guards";
import { getUserOrganizations } from "@/modules/organizations/queries";
import { getCurrentOrgId } from "@/hooks/use-current-org";
import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const memberships = await getUserOrganizations(user.id);

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const activeOrgId = await getCurrentOrgId();
  const orgs = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
  }));

  return (
    <div className="flex h-screen">
      <Sidebar orgs={orgs} activeOrgId={activeOrgId ?? orgs[0].id} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={{ name: user.name, email: user.email }} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
