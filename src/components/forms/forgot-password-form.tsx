"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type State = {
  error: string | null;
  sent: boolean;
};

export function ForgotPasswordForm() {
  async function handleSubmit(
    _prevState: State,
    formData: FormData,
  ): Promise<State> {
    const result = await forgotPasswordAction(formData);
    if (result.success) {
      return { error: null, sent: true };
    }
    return { error: result.error ?? "Something went wrong", sent: false };
  }

  const [state, action, isPending] = useActionState(handleSubmit, {
    error: null,
    sent: false,
  });

  if (state.sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            If an account exists with that email, we&apos;ve sent a password reset
            link.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login">
            <Button variant="outline">Back to sign in</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
