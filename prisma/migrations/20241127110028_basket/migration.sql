/*
  Warnings:

  - You are about to drop the column `created_at` on the `Basket` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Basket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Basket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Basket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Basket" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Basket_userId_key" ON "Basket"("userId");
