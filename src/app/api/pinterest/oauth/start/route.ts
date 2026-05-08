import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getAuthorizationUrl, storeOAuthState } from "@/server/pinterest/pinterest-oauth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  try {
    const authorizationUrl = getAuthorizationUrl();
    const state = new URL(authorizationUrl).searchParams.get("state");
    if (!state) {
      throw new Error("Failed to generate OAuth state");
    }

    await storeOAuthState(state);
    logger.info("Pinterest OAuth started", { userId: session.user.id });

    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    logger.error("Pinterest OAuth start failed", error);
    return NextResponse.redirect(
      new URL("/dashboard/settings/pinterest?error=oauth_start_failed", process.env.NEXTAUTH_URL || "http://localhost:3000"),
    );
  }
}
