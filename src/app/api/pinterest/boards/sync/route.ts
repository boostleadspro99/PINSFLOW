import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { syncBoardsForUser } from "@/features/pinterest/services/pinterest-account.service";
import { getPinterestAccountByUserId } from "@/features/pinterest/queries/pinterest-account.queries";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const account = await getPinterestAccountByUserId(session.user.id);
    if (!account) {
      return NextResponse.json({ error: "No Pinterest account connected" }, { status: 400 });
    }

    if (account.status !== "CONNECTED") {
      return NextResponse.json({ error: "Pinterest account is not connected" }, { status: 400 });
    }

    const result = await syncBoardsForUser(account.id, session.user.id);

    logger.info("Pinterest boards sync via API", {
      userId: session.user.id,
      boardCount: result.boardCount,
    });

    return NextResponse.json({ success: true, boardCount: result.boardCount });
  } catch (error) {
    logger.error("Pinterest boards sync failed", error);
    const message = error instanceof Error ? error.message : "Failed to sync boards";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
