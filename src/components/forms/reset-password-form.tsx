"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/modules/auth/actions";
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
  errors: Record<string, string[]> | null;
  reset: boolean;
};

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  async function handleSubmit(
    _prevState: State,
    formData: FormData,
  ): Promise<State> {
    formData.set("token", token);
    const result = await resetPasswordAction(formData);
    if (result.success) {
      return { errors: null, reset: true };
    }
    return {
      errors: result.error as Record<string, string[]>,
      reset: false,
    };
  }

  const [state, action, isPending] = useActionState(handleSubmit, {
    errors: null,
    reset: false,
  });

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Invalid link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/forgot-password">
            <Button variant="outline">Request a new link</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (state.reset) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Password reset</CardTitle>
          <CardDescription>
            Your password has been reset successfully.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
            {state.errors?.password && (
              <p className="text-sm text-destructive">
                {state.errors.password[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
            />
            {state.errors?.confirmPassword && (
              <p className="text-sm text-destructive">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>
          {state.errors?.token && (
            <p className="text-sm text-destructive">{state.errors.token[0]}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
