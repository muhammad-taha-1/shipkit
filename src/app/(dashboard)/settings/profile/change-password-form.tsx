"use client";

import { useActionState, useRef } from "react";
import { changePassword } from "@/modules/settings/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type State = {
  errors: Record<string, string[]> | null;
};

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(
    _prev: State,
    formData: FormData,
  ): Promise<State> {
    const result = await changePassword(formData);
    if (result.success) {
      toast.success("Password changed.");
      formRef.current?.reset();
      return { errors: null };
    }
    return { errors: result.error as Record<string, string[]> };
  }

  const [state, action, isPending] = useActionState(handleSubmit, {
    errors: null,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Change your password. You&apos;ll need your current password.
        </CardDescription>
      </CardHeader>
      <form action={action} ref={formRef}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              autoComplete="current-password"
              required
            />
            {state.errors?.currentPassword && (
              <p className="text-sm text-destructive">
                {state.errors.currentPassword[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              required
            />
            {state.errors?.newPassword && (
              <p className="text-sm text-destructive">
                {state.errors.newPassword[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
            />
            {state.errors?.confirmPassword && (
              <p className="text-sm text-destructive">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
