/*
  Warnings:

  - You are about to drop the column `content` on the `Document` table. All the data in the column will be lost.
  - Added the required column `chatThreadId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pageContent` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "content",
ADD COLUMN     "chatThreadId" TEXT NOT NULL,
ADD COLUMN     "metadata" TEXT[],
ADD COLUMN     "pageContent" TEXT NOT NULL,
ADD COLUMN     "user" TEXT NOT NULL;
