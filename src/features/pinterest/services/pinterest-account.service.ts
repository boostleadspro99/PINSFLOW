import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { encryptToken } from "@/server/pinterest/pinterest-token-crypto";
import { ensureValidAccessToken } from "@/server/pinterest/pinterest-token-refresh";
import { fetchPinterestUser } from "@/server/pinterest/pinterest-oauth";
import { fetchPinterestBoards } from "@/server/pinterest/pinterest-boards";
import { PinterestTokenError } from "@/server/pinterest/pinterest.errors";
import { getRequestedScopes, formatScopesForStorage } from "../utils/pinterest-scopes";
import type { PinterestAccountStatus } from "@prisma/client";

interface CreatePinterestAccountInput {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresIn?: number;
  scopes: string;
}

export async function createPinterestAccount(input: CreatePinterestAccountInput) {
  const { userId, accessToken, refreshToken, scopes } = input;

  // Fetch Pinterest user info
  const pinterestUser = await fetchPinterestUser(accessToken);

  const accessTokenEncrypted = encryptToken(accessToken);
  const refreshTokenEncrypted = refreshToken ? encryptToken(refreshToken) : null;

  const account = await prisma.pinterestAccount.upsert({
    where: { userId },
    update: {
      pinterestUserId: pinterestUser.id,
      username: pinterestUser.username,
      displayName: null,
      accountType: pinterestUser.account_type || null,
      accessTokenEncrypted,
      refreshTokenEncrypted,
      tokenExpiresAt: input.tokenExpiresIn
        ? new Date(Date.now() + input.tokenExpiresIn * 1000)
        : null,
      scopes,
      status: "CONNECTED",
    },
    create: {
      userId,
      pinterestUserId: pinterestUser.id,
      username: pinterestUser.username,
      displayName: null,
      accountType: pinterestUser.account_type || null,
      accessTokenEncrypted,
      refreshTokenEncrypted,
      tokenExpiresAt: input.tokenExpiresIn
        ? new Date(Date.now() + input.tokenExpiresIn * 1000)
        : null,
      scopes,
      status: "CONNECTED",
    },
  });

  logger.info("Pinterest account connected", { userId, pinterestUserId: pinterestUser.id });

  return account;
}

export async function disconnectPinterestAccount(accountId: string, userId: string) {
  const account = await prisma.pinterestAccount.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new Error("Pinterest account not found");
  }

  await prisma.pinterestAccount.update({
    where: { id: accountId },
    data: {
      status: "DISCONNECTED" as PinterestAccountStatus,
      accessTokenEncrypted: "",
      refreshTokenEncrypted: null,
    },
  });

  logger.info("Pinterest account disconnected", { userId, accountId });
}

export async function syncBoardsForUser(accountId: string, userId: string) {
  const account = await prisma.pinterestAccount.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new Error("Pinterest account not found");
  }

  if (account.status !== "CONNECTED") {
    throw new Error("Pinterest account is not connected");
  }

  if (!account.accessTokenEncrypted) {
    throw new PinterestTokenError();
  }

  const accessToken = await ensureValidAccessToken(account);

  const boards = await fetchPinterestBoards(accessToken);

  for (const board of boards) {
    await prisma.pinterestBoard.upsert({
      where: {
        pinterestAccountId_pinterestBoardId: {
          pinterestAccountId: accountId,
          pinterestBoardId: board.pinterestBoardId,
        },
      },
      update: {
        name: board.name,
        description: board.description,
        url: board.url,
        privacy: board.privacy,
        ownerUsername: board.ownerUsername,
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        pinterestAccountId: accountId,
        pinterestBoardId: board.pinterestBoardId,
        name: board.name,
        description: board.description,
        url: board.url,
        privacy: board.privacy,
        ownerUsername: board.ownerUsername,
        lastSyncedAt: new Date(),
      },
    });
  }

  // Update the account's last synced timestamp
  await prisma.pinterestAccount.update({
    where: { id: accountId },
    data: { updatedAt: new Date() },
  });

  logger.info("Pinterest boards synced", { userId, accountId, boardCount: boards.length });

  return { boardCount: boards.length };
}
