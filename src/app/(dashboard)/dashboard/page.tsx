import { requireAuth } from "@/modules/auth/guards";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome back, {user.name?.split(" ")[0] ?? "there"}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Here&apos;s an overview of your workspace.
      </p>
    </div>
  );
}
