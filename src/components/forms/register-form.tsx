"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/modules/auth/actions";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type State = {
  errors: Record<string, string[]> | null;
  registered: boolean;
};

export function RegisterForm() {
  async function handleSubmit(
    _prevState: State,
    formData: FormData,
  ): Promise<State> {
    const result = await registerAction(formData);
    if (result.success) {
      toast.success("Account created! Check your email to verify.");
      return { errors: null, registered: true };
    }
    return {
      errors: result.error as Record<string, string[]>,
      registered: false,
    };
  }

  const [state, action, isPending] = useActionState(handleSubmit, {
    errors: null,
    registered: false,
  });

  if (state.registered) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to your email address. Please verify
            your email before signing in.
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
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>Get started with ShipKit</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Your name" required />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
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
            {state.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirmPassword">Confirm password</Label>
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
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
