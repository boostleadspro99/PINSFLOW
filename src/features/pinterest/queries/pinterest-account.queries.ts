import { prisma } from "@/lib/prisma";
import type { PinterestAccountWithBoards, PinterestBoardItem } from "../types/pinterest.types";

export async function getPinterestAccountByUserId(
  userId: string,
): Promise<PinterestAccountWithBoards | null> {
  const account = await prisma.pinterestAccount.findUnique({
    where: { userId },
    include: {
      boards: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!account) return null;

  return {
    id: account.id,
    userId: account.userId,
    pinterestUserId: account.pinterestUserId,
    username: account.username,
    displayName: account.displayName,
    accountType: account.accountType,
    scopes: account.scopes,
    status: account.status,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    boards: account.boards.map(mapBoard),
  };
}

export async function getPinterestAccountById(
  accountId: string,
  userId: string,
): Promise<PinterestAccountWithBoards | null> {
  const account = await prisma.pinterestAccount.findFirst({
    where: { id: accountId, userId },
    include: {
      boards: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!account) return null;

  return {
    id: account.id,
    userId: account.userId,
    pinterestUserId: account.pinterestUserId,
    username: account.username,
    displayName: account.displayName,
    accountType: account.accountType,
    scopes: account.scopes,
    status: account.status,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    boards: account.boards.map(mapBoard),
  };
}

function mapBoard(board: {
  id: string;
  pinterestBoardId: string;
  name: string;
  description: string | null;
  url: string | null;
  privacy: string | null;
  ownerUsername: string | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
}): PinterestBoardItem {
  return {
    id: board.id,
    pinterestBoardId: board.pinterestBoardId,
    name: board.name,
    description: board.description,
    url: board.url,
    privacy: board.privacy,
    ownerUsername: board.ownerUsername,
    lastSyncedAt: board.lastSyncedAt,
    createdAt: board.createdAt,
  };
}
