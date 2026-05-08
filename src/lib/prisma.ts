import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Add logic here if you want query logging, etc.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
