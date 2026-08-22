import type { Metadata } from "next";
import { requireAuth } from "@/modules/auth/guards";
import { getCurrentOrgId } from "@/hooks/use-current-org";
import {
  getOrganizationMembers,
  getOrganizationInvitations,
} from "@/modules/organizations/queries";
import { InviteMemberForm } from "@/components/forms/invite-member-form";
import { MemberList } from "./member-list";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const user = await requireAuth();
  const orgId = await getCurrentOrgId();

  if (!orgId) return <p>No organization selected.</p>;

  const [members, invitations] = await Promise.all([
    getOrganizationMembers(orgId),
    getOrganizationInvitations(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage your team members and invitations.
          </p>
        </div>
        <InviteMemberForm orgId={orgId} />
      </div>
      <MemberList
        members={members}
        invitations={invitations}
        currentUserId={user.id}
        orgId={orgId}
      />
    </div>
  );
}
