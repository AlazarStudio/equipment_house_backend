/*
  Warnings:

  - You are about to drop the column `Comment` on the `FeedBack` table. All the data in the column will be lost.
  - You are about to drop the column `Phone` on the `FeedBack` table. All the data in the column will be lost.
  - Added the required column `comment` to the `FeedBack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `FeedBack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeedBack" DROP COLUMN "Comment",
DROP COLUMN "Phone",
ADD COLUMN     "comment" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
