import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/modules/auth/guards";
import { getOrgDetail } from "@/modules/admin/queries";
import { OrgDetail } from "./org-detail";

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;

  let org;
  try {
    org = await getOrgDetail(id);
  } catch {
    notFound();
  }

  return <OrgDetail org={org} />;
}
