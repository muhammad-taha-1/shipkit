import { requireSuperAdmin } from "@/modules/auth/guards";
import { getAdminUsers } from "@/modules/admin/queries";
import { UserList } from "./user-list";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; cursor?: string }>;
}) {
  const admin = await requireSuperAdmin();
  const params = await searchParams;

  const { items, nextCursor } = await getAdminUsers({
    search: params.search,
    cursor: params.cursor,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage all users across the system.
        </p>
      </div>

      <UserList
        users={items}
        currentUserId={admin.id}
        search={params.search ?? null}
        nextCursor={nextCursor}
      />
    </div>
  );
}
