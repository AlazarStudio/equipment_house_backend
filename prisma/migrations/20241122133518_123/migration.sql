-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_businessSolutionId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "businessSolutionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessSolutionId_fkey" FOREIGN KEY ("businessSolutionId") REFERENCES "BusinessSolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
