import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { decryptToken, encryptToken } from "./pinterest-token-crypto";
import { refreshAccessToken } from "./pinterest-oauth";
import { PinterestTokenError } from "./pinterest.errors";
import type { PinterestAccount } from "@prisma/client";

const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

type RefreshableAccount = Pick<
  PinterestAccount,
  "id" | "accessTokenEncrypted" | "refreshTokenEncrypted" | "tokenExpiresAt"
>;

/**
 * Returns a valid decrypted access token for the given Pinterest account.
 *
 * - If the current token is still valid (> 5 min buffer), returns it as-is.
 * - If expired or close to expiring, refreshes via the Pinterest API.
 * - If refresh fails or no refresh token is available, sets account status to EXPIRED.
 */
export async function ensureValidAccessToken(
  account: RefreshableAccount,
): Promise<string> {
  // Token is still fresh — return as-is
  if (
    account.tokenExpiresAt &&
    account.tokenExpiresAt.getTime() > Date.now() + EXPIRY_BUFFER_MS
  ) {
    return decryptToken(account.accessTokenEncrypted);
  }

  // No tokenExpiresAt set — can't determine expiry, return as-is
  if (!account.tokenExpiresAt) {
    return decryptToken(account.accessTokenEncrypted);
  }

  // Token is expired or within buffer — try to refresh
  if (!account.refreshTokenEncrypted) {
    logger.warn("Pinterest token expired and no refresh token available", {
      accountId: account.id,
    });
    await setExpired(account.id);
    throw new PinterestTokenError(
      "Pinterest token has expired. Please reconnect your account.",
    );
  }

  let refreshTokenPlain: string;
  try {
    refreshTokenPlain = decryptToken(account.refreshTokenEncrypted);
  } catch {
    logger.error("Failed to decrypt Pinterest refresh token", {
      accountId: account.id,
    });
    await setExpired(account.id);
    throw new PinterestTokenError(
      "Failed to decrypt Pinterest refresh token. Please reconnect your account.",
    );
  }

  let tokenResponse: Awaited<ReturnType<typeof refreshAccessToken>>;
  try {
    tokenResponse = await refreshAccessToken(refreshTokenPlain);
  } catch (err) {
    logger.error("Pinterest token refresh failed", {
      accountId: account.id,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    await setExpired(account.id);
    throw new PinterestTokenError(
      "Pinterest token refresh failed. Please reconnect your account.",
    );
  }

  // Encrypt and store the new tokens
  const newAccessTokenEncrypted = encryptToken(tokenResponse.access_token);
  const newRefreshTokenEncrypted = tokenResponse.refresh_token
    ? encryptToken(tokenResponse.refresh_token)
    : undefined; // Preserve old refresh token if Pinterest doesn't return a new one

  const updateData: Record<string, unknown> = {
    accessTokenEncrypted: newAccessTokenEncrypted,
    tokenExpiresAt: new Date(
      Date.now() + tokenResponse.expires_in * 1000,
    ),
    status: "CONNECTED",
  };

  if (newRefreshTokenEncrypted) {
    updateData.refreshTokenEncrypted = newRefreshTokenEncrypted;
  }

  await prisma.pinterestAccount.update({
    where: { id: account.id },
    data: updateData,
  });

  logger.info("Pinterest token refreshed successfully", {
    accountId: account.id,
  });

  return tokenResponse.access_token;
}

async function setExpired(accountId: string): Promise<void> {
  await prisma.pinterestAccount.update({
    where: { id: accountId },
    data: { status: "EXPIRED" },
  });
}
