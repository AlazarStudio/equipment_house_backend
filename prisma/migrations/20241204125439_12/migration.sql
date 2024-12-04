/*
  Warnings:

  - You are about to drop the column `created_at` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `img` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `characteristics` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "created_at",
DROP COLUMN "img",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "availability",
DROP COLUMN "characteristics",
DROP COLUMN "code",
DROP COLUMN "created_at",
DROP COLUMN "type",
DROP COLUMN "updated_at",
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;
