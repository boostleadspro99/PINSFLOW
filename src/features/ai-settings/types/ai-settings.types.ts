import { ProjectAISettings, AIModelConfig } from "@prisma/client";
import { ModelRegistryEntry } from "@/config/ai-models";

export type ProjectAISettingsWithRelations = ProjectAISettings & {
  project: { name: string };
};

export type AIModelConfigWithStatus = ModelRegistryEntry;

export type { ModelRegistryEntry };
