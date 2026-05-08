"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncPinterestBoardsSchema } from "../schemas/pinterest.schema";
import { syncBoardsForUser } from "../services/pinterest-account.service";

export type SyncBoardsActionResult =
  | { success: true; boardCount: number }
  | { success: false; error: string };

export async function syncPinterestBoardsAction(
  _prevState: SyncBoardsActionResult | null,
  formData: FormData,
): Promise<SyncBoardsActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }

  const raw = {
    accountId: formData.get("accountId") as string,
  };

  const parsed = syncPinterestBoardsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Invalid request." };
  }

  try {
    const result = await syncBoardsForUser(parsed.data.accountId, session.user.id);
    return { success: true, boardCount: result.boardCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync Pinterest boards.";
    return { success: false, error: message };
  }
}
