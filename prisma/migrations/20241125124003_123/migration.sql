/*
  Warnings:

  - The `img` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `img` on the `SubCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "img",
ADD COLUMN     "img" TEXT[];

-- AlterTable
ALTER TABLE "SubCategory" DROP COLUMN "img";
