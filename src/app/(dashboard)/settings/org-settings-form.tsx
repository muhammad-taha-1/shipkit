"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrganization } from "@/modules/organizations/actions";
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
import { OrgLogoUpload } from "@/components/uploads/org-logo-upload";

type State = {
  error: string | null;
};

export function OrgSettingsForm({
  org,
  canUpdate,
}: {
  org: { id: string; name: string; slug: string; logo: string | null };
  canUpdate: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(org.name);
  const [slug, setSlug] = useState(org.slug);

  async function handleSubmit(
    _prev: State,
    formData: FormData,
  ): Promise<State> {
    const result = await updateOrganization(org.id, formData);
    if (result.success) {
      toast.success("Organization updated.");
      router.refresh();
      return { error: null };
    }
    return { error: typeof result.error === "string" ? result.error : "Update failed" };
  }

  const [state, action, isPending] = useActionState(handleSubmit, {
    error: null,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>
          Update your organization name and URL slug.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {canUpdate && (
            <div className="flex justify-center pb-2">
              <OrgLogoUpload
                currentLogo={org.logo}
                orgName={org.name}
                orgId={org.id}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canUpdate}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">URL slug</Label>
            <Input
              id="org-slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!canUpdate}
            />
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
          </div>
        </CardContent>
        {canUpdate && (
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
