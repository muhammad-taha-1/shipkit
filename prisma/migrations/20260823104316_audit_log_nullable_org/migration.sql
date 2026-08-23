-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_organizationId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
