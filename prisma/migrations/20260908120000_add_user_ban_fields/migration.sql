-- AlterTable
ALTER TABLE "users" ADD COLUMN "bannedAt" TIMESTAMP(3),
ADD COLUMN "bannedReason" TEXT;
