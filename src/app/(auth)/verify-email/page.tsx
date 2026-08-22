import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmailAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="text-2xl font-bold">Invalid link</CardTitle>
          <CardDescription>
            This verification link is invalid.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const result = await verifyEmailAction(token);

  return (
    <Card>
      <CardHeader className="text-center">
        {result.success ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-2xl font-bold">Email verified</CardTitle>
            <CardDescription>
              Your email has been verified. You can now sign in.
            </CardDescription>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="text-2xl font-bold">
              Verification failed
            </CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardFooter className="justify-center">
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
