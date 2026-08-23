"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/modules/organizations/actions";
import { generateSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type State = {
  errors: Record<string, string[]> | null;
};

export function OrgCreateForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");

  async function handleSubmit(
    _prevState: State,
    formData: FormData,
  ): Promise<State> {
    const result = await createOrganization(formData);
    if (result.success) {
      toast.success("Workspace created!");
      router.push("/dashboard");
      router.refresh();
      return { errors: null };
    }
    return { errors: result.error as Record<string, string[]> };
  }

  const [state, action, isPending] = useActionState(handleSubmit, {
    errors: null,
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create your workspace</CardTitle>
        <CardDescription>
          Set up your organization to start collaborating
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Inc"
              required
              onChange={(e) => setSlug(generateSlug(e.target.value))}
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="acme-inc"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            {state.errors?.slug && (
              <p className="text-sm text-destructive">{state.errors.slug[0]}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Used in URLs: yourapp.com/{slug || "your-slug"}
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create workspace
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
