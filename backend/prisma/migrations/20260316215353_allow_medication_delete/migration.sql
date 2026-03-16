-- DropForeignKey
ALTER TABLE "OrderLine" DROP CONSTRAINT "OrderLine_medicationId_fkey";

-- AlterTable
ALTER TABLE "OrderLine" ALTER COLUMN "medicationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
