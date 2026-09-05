import { requireSuperAdmin } from "@/modules/auth/guards";
import { getAdminOrganizations } from "@/modules/admin/queries";
import { OrgList } from "./org-list";

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; cursor?: string }>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;

  const { items, nextCursor } = await getAdminOrganizations({
    search: params.search,
    cursor: params.cursor,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Organization Management
        </h1>
        <p className="mt-1 text-muted-foreground">
          View and manage all organizations across the system.
        </p>
      </div>

      <OrgList
        orgs={items}
        search={params.search ?? null}
        nextCursor={nextCursor}
      />
    </div>
  );
}
