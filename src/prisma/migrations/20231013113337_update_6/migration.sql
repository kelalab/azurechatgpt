-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "useName" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,
    "chatType" TEXT NOT NULL,
    "conversationStyle" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);
