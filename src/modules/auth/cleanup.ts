import "server-only";
import { db } from "@/lib/db";

export async function cleanupExpiredTokens() {
  const now = new Date();

  const [verificationResult, resetResult, invitationResult] = await Promise.all([
    db.verificationToken.deleteMany({
      where: { expires: { lt: now } },
    }),
    db.passwordResetToken.deleteMany({
      where: { expires: { lt: now } },
    }),
    db.invitation.updateMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: now },
      },
      data: { status: "EXPIRED" },
    }),
  ]);

  return {
    verificationTokens: verificationResult.count,
    passwordResetTokens: resetResult.count,
    expiredInvitations: invitationResult.count,
  };
}
