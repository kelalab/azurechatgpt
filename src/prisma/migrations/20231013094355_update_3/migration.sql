/*
  Warnings:

  - You are about to drop the column `vector` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "vector",
ADD COLUMN     "embedding" vector;
