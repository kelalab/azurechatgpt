/*
  Warnings:

  - You are about to drop the column `useName` on the `ChatThread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatThread" DROP COLUMN "useName",
ADD COLUMN     "userName" TEXT NOT NULL DEFAULT 'user';
