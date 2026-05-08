"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { disconnectPinterestSchema } from "../schemas/pinterest.schema";
import { disconnectPinterestAccount } from "../services/pinterest-account.service";

export type DisconnectActionResult =
  | { success: true }
  | { success: false; error: string };

export async function disconnectPinterestAction(
  _prevState: DisconnectActionResult | null,
  formData: FormData,
): Promise<DisconnectActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }

  const raw = {
    accountId: formData.get("accountId") as string,
  };

  const parsed = disconnectPinterestSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Invalid request." };
  }

  try {
    await disconnectPinterestAccount(parsed.data.accountId, session.user.id);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to disconnect Pinterest account.";
    return { success: false, error: message };
  }
}
