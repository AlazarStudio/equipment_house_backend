/*
  Warnings:

  - The `img` column on the `BusinessSolution` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `img` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `img` column on the `News` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BusinessSolution" DROP COLUMN "img",
ADD COLUMN     "img" TEXT[];

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "img",
ADD COLUMN     "img" TEXT[];

-- AlterTable
ALTER TABLE "News" DROP COLUMN "img",
ADD COLUMN     "img" TEXT[];
