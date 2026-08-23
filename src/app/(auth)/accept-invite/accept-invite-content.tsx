"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { acceptInvitation } from "@/modules/members/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function AcceptInviteContent({ token }: { token: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No invitation token provided.");
      return;
    }

    async function accept() {
      const result = await acceptInvitation(token!);
      if (result.success) {
        setStatus("success");
        setOrgId(result.orgId ?? null);
      } else {
        setStatus("error");
        setError(result.error ?? "Failed to accept invitation.");
      }
    }

    accept();
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Accepting invitation...</CardTitle>
            <CardDescription>Please wait while we process your invitation.</CardDescription>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">You&apos;re in!</CardTitle>
            <CardDescription>
              Your invitation has been accepted. You now have access to the workspace.
            </CardDescription>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-2">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Invitation failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardFooter className="justify-center">
        {status === "success" && (
          <Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
        )}
        {status === "error" && (
          <Link href="/dashboard">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
