import { AITaskType, AIProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AiProvider } from "./ai.types";
import { GeminiProvider } from "./providers/gemini.provider";
import { CloudflareTextProvider } from "./providers/cloudflare-text.provider";
import { getDefaultModelForTask, getModelByKey } from "@/config/ai-models";

// ── Provider instances (singletons) ──────────────────────────────────

const geminiClient = new GeminiProvider();
const cloudflareTextClient = new CloudflareTextProvider();

const providerMap: Partial<Record<AIProvider, AiProvider>> = {
  [AIProvider.GEMINI]: geminiClient,
  [AIProvider.CLOUDFLARE]: cloudflareTextClient,
};

// ── Provider resolution ──────────────────────────────────────────────

function getProviderForProviderEnum(providerEnum: AIProvider): AiProvider {
  const provider = providerMap[providerEnum];
  if (!provider) {
    console.warn(`No AiProvider implementation for ${providerEnum}. Falling back to Gemini.`);
    return geminiClient;
  }
  return provider;
}

function getProviderForModelKey(modelKey: string): AiProvider {
  const model = getModelByKey(modelKey);
  if (!model) {
    console.warn(`Model key "${modelKey}" not found in registry. Falling back to Gemini.`);
    return geminiClient;
  }
  return getProviderForProviderEnum(model.provider);
}

// ── Public API ───────────────────────────────────────────────────────

export const getAiClient = (): AiProvider => {
  return geminiClient;
};

export async function resolveModelForTask(
  projectId: string,
  taskType: AITaskType
): Promise<{ modelKey: string; provider: AiProvider }> {
  const settings = await prisma.projectAISettings.findUnique({
    where: { projectId },
  });

  let modelKey: string | null | undefined;

  switch (taskType) {
    case AITaskType.CONTENT_IDEAS:
      modelKey = settings?.contentIdeasModelId;
      break;
    case AITaskType.PIN_DRAFTS:
      modelKey = settings?.pinDraftsModelId;
      break;
    case AITaskType.IMAGE_PROMPT:
      modelKey = settings?.imagePromptModelId;
      break;
    default:
      modelKey = settings?.fallbackModelId;
      break;
  }

  // If project-level model is set and exists in registry, use it
  if (modelKey) {
    const registryModel = getModelByKey(modelKey);
    if (registryModel && registryModel.status === "ACTIVE") {
      return { modelKey, provider: getProviderForModelKey(modelKey) };
    }
  }

  // Try fallback if set
  if (settings?.fallbackModelId) {
    const fallback = getModelByKey(settings.fallbackModelId);
    if (fallback && fallback.status === "ACTIVE") {
      return { modelKey: settings.fallbackModelId, provider: getProviderForModelKey(settings.fallbackModelId) };
    }
  }

  // Fall back to default model from registry
  const defaultModel = getDefaultModelForTask(taskType);
  return { modelKey: defaultModel.modelKey, provider: getProviderForModelKey(defaultModel.modelKey) };
}
