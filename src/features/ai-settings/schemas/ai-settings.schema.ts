import { z } from "zod";

export const updateProjectAISettingsSchema = z.object({
  projectId: z.string().min(1),
  contentIdeasModelId: z.string().nullable().optional(),
  pinDraftsModelId: z.string().nullable().optional(),
  imagePromptModelId: z.string().nullable().optional(),
  fallbackModelId: z.string().nullable().optional(),
});

export type UpdateProjectAISettingsInput = z.infer<typeof updateProjectAISettingsSchema>;
