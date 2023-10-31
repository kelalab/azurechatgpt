-- CreateTable
CREATE TABLE "ChatDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chatThreadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ChatDocument_pkey" PRIMARY KEY ("id")
);
