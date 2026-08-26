import type { Metadata } from "next";
import { requireAuth } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { getConnectedAccounts } from "@/modules/settings/actions";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { ConnectedAccounts } from "./connected-accounts";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireAuth();

  const [dbUser, accounts] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        passwordHash: true,
        createdAt: true,
      },
    }),
    getConnectedAccounts(user.id),
  ]);

  const hasPassword = !!dbUser.passwordHash;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal account settings.
        </p>
      </div>

      <ProfileForm
        user={{ name: dbUser.name ?? "", email: dbUser.email }}
      />

      {hasPassword && <ChangePasswordForm />}

      <ConnectedAccounts accounts={accounts} hasPassword={hasPassword} />
    </div>
  );
}
