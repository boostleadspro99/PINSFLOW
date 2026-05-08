import crypto from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { pinterestConfig } from "@/config/pinterest";
import type { PinterestTokenResponse, PinterestUserAccount } from "./pinterest.types";
import { PinterestApiError, PinterestAuthError } from "./pinterest.errors";

const OAUTH_STATE_COOKIE = "pinterest_oauth_state";
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function getBaseUrl(): string {
  return env.PINTEREST_REDIRECT_URI?.replace("/oauth/callback", "") || pinterestConfig.apiBaseUrl;
}

export function getAuthorizationUrl(): string {
  const clientId = env.PINTEREST_CLIENT_ID;
  if (!clientId) {
    throw new PinterestAuthError("PINTEREST_CLIENT_ID is not configured");
  }

  const redirectUri = env.PINTEREST_REDIRECT_URI;
  if (!redirectUri) {
    throw new PinterestAuthError("PINTEREST_REDIRECT_URI is not configured");
  }

  const state = crypto.randomBytes(32).toString("hex");
  const scopes = pinterestConfig.scopes.join(",");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state,
  });

  return `https://www.pinterest.com/oauth/?${params.toString()}`;
}

export async function storeOAuthState(state: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STATE_EXPIRY_MS / 1000,
    path: "/",
  });
}

export async function validateOAuthState(state: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  if (!storedState || storedState !== state) {
    return false;
  }

  // Clear the used state cookie
  cookieStore.delete(OAUTH_STATE_COOKIE);
  return true;
}

export async function exchangeAuthorizationCode(code: string): Promise<PinterestTokenResponse> {
  const clientId = env.PINTEREST_CLIENT_ID;
  const clientSecret = env.PINTEREST_CLIENT_SECRET;
  const redirectUri = env.PINTEREST_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new PinterestAuthError("Pinterest OAuth is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  let response: Response;
  try {
    response = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });
  } catch (err) {
    throw new PinterestAuthError("Failed to reach Pinterest OAuth token endpoint");
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new PinterestAuthError("Failed to exchange authorization code with Pinterest");
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<PinterestTokenResponse> {
  const clientId = env.PINTEREST_CLIENT_ID;
  const clientSecret = env.PINTEREST_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new PinterestAuthError("Pinterest OAuth is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  let response: Response;
  try {
    response = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });
  } catch {
    throw new PinterestAuthError("Failed to refresh Pinterest token");
  }

  if (!response.ok) {
    throw new PinterestAuthError("Pinterest token refresh failed");
  }

  return response.json();
}

export async function fetchPinterestUser(accessToken: string): Promise<PinterestUserAccount> {
  const response = await fetch("https://api.pinterest.com/v5/user_account", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new PinterestApiError("Failed to fetch Pinterest user account", response.status);
  }

  return response.json();
}
