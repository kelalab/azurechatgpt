"use server";

import { PrismaClient } from "@prisma/client";

export const initDBContainer = async () => {
  const db = new PrismaClient();
  return db;
};
