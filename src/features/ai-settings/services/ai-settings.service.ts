import { prisma } from "@/lib/prisma";
import { UpdateProjectAISettingsInput } from "../schemas/ai-settings.schema";
import { getModelByKey } from "@/config/ai-models";

export async function updateProjectAISettings(userId: string, input: UpdateProjectAISettingsInput) {
  const { projectId, ...settings } = input;

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found or unauthorized");

  // Validate that modelKeys exist in registry if set
  const modelFields = ["contentIdeasModelId", "pinDraftsModelId", "imagePromptModelId", "fallbackModelId"] as const;
  for (const field of modelFields) {
    const value = settings[field];
    if (value && !getModelByKey(value)) {
      throw new Error(`Invalid model key for ${field}: ${value}`);
    }
  }

  return prisma.projectAISettings.upsert({
    where: { projectId },
    create: {
      projectId,
      ...settings,
    },
    update: settings,
  });
}
