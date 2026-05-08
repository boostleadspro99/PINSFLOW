import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { pinterestOAuthCallbackSchema } from "@/features/pinterest/schemas/pinterest.schema";
import { validateOAuthState, exchangeAuthorizationCode } from "@/server/pinterest/pinterest-oauth";
import { createPinterestAccount } from "@/features/pinterest/services/pinterest-account.service";
import { getRequestedScopes, formatScopesForStorage } from "@/features/pinterest/utils/pinterest-scopes";

const SETTINGS_URL = "/dashboard/settings/pinterest";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  const { searchParams } = req.nextUrl;
  const raw = {
    code: searchParams.get("code"),
    state: searchParams.get("state"),
  };

  const parsed = pinterestOAuthCallbackSchema.safeParse(raw);
  if (!parsed.success) {
    logger.error("Pinterest OAuth callback: invalid params", { userId: session.user.id });
    return NextResponse.redirect(
      new URL(`${SETTINGS_URL}?error=invalid_params`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
    );
  }

  // Validate OAuth state
  const stateValid = await validateOAuthState(parsed.data.state);
  if (!stateValid) {
    logger.error("Pinterest OAuth callback: invalid state", { userId: session.user.id });
    return NextResponse.redirect(
      new URL(`${SETTINGS_URL}?error=invalid_state`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
    );
  }

  try {
    // Exchange code for tokens
    let tokenResponse;
    try {
      tokenResponse = await exchangeAuthorizationCode(parsed.data.code);
    } catch (exchangeError) {
      const msg = exchangeError instanceof Error ? exchangeError.message : "Unknown error";
      logger.error("Pinterest OAuth callback: token exchange failed", { error: msg });
      return NextResponse.redirect(
        new URL(`${SETTINGS_URL}?error=token_exchange_failed&details=${encodeURIComponent(msg)}`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
      );
    }

    // Create account
    try {
      await createPinterestAccount({
        userId: session.user.id,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiresIn: tokenResponse.expires_in,
        scopes: tokenResponse.scope || formatScopesForStorage(getRequestedScopes()),
      });
    } catch (accountError) {
      const msg = accountError instanceof Error ? accountError.message : "Unknown error";
      logger.error("Pinterest OAuth callback: account creation failed", { error: msg });
      return NextResponse.redirect(
        new URL(`${SETTINGS_URL}?error=account_creation_failed&details=${encodeURIComponent(msg)}`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
      );
    }

    logger.info("Pinterest OAuth callback succeeded", { userId: session.user.id });

    return NextResponse.redirect(
      new URL(`${SETTINGS_URL}?connected=true`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
    );
  } catch (error) {
    logger.error("Pinterest OAuth callback failed", error);
    return NextResponse.redirect(
      new URL(`${SETTINGS_URL}?error=connection_failed`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
    );
  }
}
