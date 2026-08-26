"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Account = {
  provider: string;
};

const providerLabels: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

export function ConnectedAccounts({
  accounts,
  hasPassword,
}: {
  accounts: Account[];
  hasPassword: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Social login providers linked to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {hasPassword
              ? "No social accounts connected. You can connect Google or GitHub from the login page."
              : "No social accounts connected."}
          </p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.provider}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium">
                      {(providerLabels[account.provider] ?? account.provider)[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {providerLabels[account.provider] ?? account.provider}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Linked to your account
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
