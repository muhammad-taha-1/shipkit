import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/guards";
import { getUserOrganizations } from "@/modules/organizations/queries";
import { getActiveOrgId } from "@/hooks/use-current-org";
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

  const orgs = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    logo: m.organization.logo,
  }));

  const activeOrgId = (await getActiveOrgId(user.id)) ?? orgs[0].id;

  return (
    <div className="flex h-screen">
      <Sidebar orgs={orgs} activeOrgId={activeOrgId} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={{ name: user.name, email: user.email, image: user.image }} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
