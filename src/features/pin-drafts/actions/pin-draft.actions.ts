"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPinDraft, updatePinDraftStatus } from "../services/pin-draft.service";
import { revalidatePath } from "next/cache";

export async function createPinDraftAction(ideaId: string, projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await createPinDraft(session.user.id, ideaId, projectId);
  revalidatePath(`/dashboard/projects/${projectId}/pins`);
}

export async function updatePinDraftStatusAction(pinDraftId: string, projectId: string, status: "APPROVED" | "ARCHIVED") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await updatePinDraftStatus(session.user.id, pinDraftId, status);
  revalidatePath(`/dashboard/projects/${projectId}/pins`);
}
