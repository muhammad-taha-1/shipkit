import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/modules/auth/guards";
import { getUserDetail } from "@/modules/admin/queries";
import { UserDetail } from "./user-detail";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireSuperAdmin();
  const { id } = await params;

  let user;
  try {
    user = await getUserDetail(id);
  } catch {
    notFound();
  }

  return <UserDetail user={user} currentAdminId={admin.id} />;
}
