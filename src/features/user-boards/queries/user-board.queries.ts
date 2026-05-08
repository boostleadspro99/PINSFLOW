import { prisma } from "@/lib/prisma";
import type { UserBoard } from "@prisma/client";

export async function getUserBoards(userId: string): Promise<UserBoard[]> {
  return prisma.userBoard.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserBoardById(userId: string, id: string): Promise<UserBoard | null> {
  return prisma.userBoard.findFirst({
    where: { id, userId },
  });
}
