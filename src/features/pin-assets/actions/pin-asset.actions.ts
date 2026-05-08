"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePinAsset, attachPinAssetUrl, archivePinAsset } from "../services/pin-asset.service";
import { generatePinAssetSchema, attachPinAssetUrlSchema, archivePinAssetSchema } from "../schemas/pin-asset.schema";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function generatePinAssetAction(
  pinDraftId: string,
  projectId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = generatePinAssetSchema.safeParse({ pinDraftId, projectId });
    if (!parsed.success) {
      return { success: false, error: "Invalid input" };
    }

    const asset = await generatePinAsset(session.user.id, pinDraftId, projectId);
    revalidatePath(`/dashboard/projects/${projectId}/pins`);
    return { success: true, data: { id: asset.id } };
  } catch (error) {
    console.error("Generate pin asset error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate image asset";
    return { success: false, error: message };
  }
}

export async function attachPinAssetUrlAction(
  pinDraftId: string,
  projectId: string,
  imageUrl: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = attachPinAssetUrlSchema.safeParse({ pinDraftId, projectId, imageUrl });
    if (!parsed.success) {
      return { success: false, error: "Invalid image URL" };
    }

    const asset = await attachPinAssetUrl(session.user.id, pinDraftId, projectId, imageUrl);
    revalidatePath(`/dashboard/projects/${projectId}/pins`);
    return { success: true, data: { id: asset.id } };
  } catch (error) {
    console.error("Attach pin asset URL error:", error);
    const message = error instanceof Error ? error.message : "Failed to attach image URL";
    return { success: false, error: message };
  }
}

export async function archivePinAssetAction(
  pinAssetId: string,
  projectId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = archivePinAssetSchema.safeParse({ pinAssetId, projectId });
    if (!parsed.success) {
      return { success: false, error: "Invalid input" };
    }

    await archivePinAsset(session.user.id, pinAssetId, projectId);
    revalidatePath(`/dashboard/projects/${projectId}/pins`);
    return { success: true };
  } catch (error) {
    console.error("Archive pin asset error:", error);
    const message = error instanceof Error ? error.message : "Failed to archive image asset";
    return { success: false, error: message };
  }
}
