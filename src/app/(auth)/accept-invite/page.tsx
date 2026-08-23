import type { Metadata } from "next";
import { AcceptInviteContent } from "./accept-invite-content";

export const metadata: Metadata = {
  title: "Accept Invitation",
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <AcceptInviteContent token={params.token ?? null} />;
}
