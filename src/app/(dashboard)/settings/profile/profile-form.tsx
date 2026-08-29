"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/modules/settings/actions";
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
import { AvatarUpload } from "@/components/uploads/avatar-upload";

type State = {
  errors: Record<string, string[]> | null;
};

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; image: string | null };
}) {
  const router = useRouter();

  async function handleSubmit(
    _prev: State,
    formData: FormData,
  ): Promise<State> {
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success("Profile updated.");
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
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your personal information.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="flex justify-center pb-2">
            <AvatarUpload
              currentImage={user.image}
              userName={user.name}
              userEmail={user.email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              name="name"
              defaultValue={user.name}
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              value={user.email}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save profile
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
