import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrgCreateForm } from "@/components/forms/org-create-form";
import { requireAuth } from "@/modules/auth/guards";
import { getUserOrganizations } from "@/modules/organizations/queries";

export const metadata: Metadata = {
  title: "Create workspace",
};

export default async function OnboardingPage() {
  const user = await requireAuth();
  const memberships = await getUserOrganizations(user.id);

  if (memberships.length > 0) {
    redirect("/dashboard");
  }

  return <OrgCreateForm />;
}
