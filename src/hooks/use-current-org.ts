import { cookies } from "next/headers";

export async function getCurrentOrgId() {
  const cookieStore = await cookies();
  return cookieStore.get("active-org-id")?.value ?? null;
}
