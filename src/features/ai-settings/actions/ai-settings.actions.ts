"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateProjectAISettingsSchema } from "../schemas/ai-settings.schema";
import { updateProjectAISettings } from "../services/ai-settings.service";

export async function updateProjectAISettingsAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const raw = {
    projectId: formData.get("projectId"),
    contentIdeasModelId: formData.get("contentIdeasModelId") || null,
    pinDraftsModelId: formData.get("pinDraftsModelId") || null,
    imagePromptModelId: formData.get("imagePromptModelId") || null,
    fallbackModelId: formData.get("fallbackModelId") || null,
  };

  const parsed = updateProjectAISettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await updateProjectAISettings(session.user.id, parsed.data);
    revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to update AI settings",
    };
  }
}
