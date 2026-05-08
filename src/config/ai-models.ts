import { AIProvider, AITaskType, AIModelStatus } from "@prisma/client";

export type CostTier = "LOW_COST" | "PREMIUM" | "UNKNOWN";

export interface ModelRegistryEntry {
  provider: AIProvider;
  modelKey: string;
  modelId: string;
  displayName: string;
  capability: AITaskType;
  status: AIModelStatus;
  isDefault: boolean;
  costTier?: CostTier;
}

const defaultModels: ModelRegistryEntry[] = [
  // Content Ideas
  {
    provider: AIProvider.GEMINI,
    modelKey: "gemini-flash-content-ideas",
    modelId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    capability: AITaskType.CONTENT_IDEAS,
    status: AIModelStatus.ACTIVE,
    isDefault: false,
    costTier: "PREMIUM",
  },
  {
    provider: AIProvider.CLOUDFLARE,
    modelKey: "cloudflare-qwen3-content-ideas",
    modelId: "@cf/qwen/qwen3-30b-a3b-fp8",
    displayName: "Cloudflare Qwen3 30B",
    capability: AITaskType.CONTENT_IDEAS,
    status: AIModelStatus.ACTIVE,
    isDefault: true,
    costTier: "LOW_COST",
  },
  {
    provider: AIProvider.MOCK,
    modelKey: "mock-content-ideas",
    modelId: "mock-ideas",
    displayName: "Mock (test only)",
    capability: AITaskType.CONTENT_IDEAS,
    status: AIModelStatus.ACTIVE,
    isDefault: false,
    costTier: "LOW_COST",
  },
  // Pin Drafts
  {
    provider: AIProvider.GEMINI,
    modelKey: "gemini-flash-pin-drafts",
    modelId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    capability: AITaskType.PIN_DRAFTS,
    status: AIModelStatus.ACTIVE,
    isDefault: false,
    costTier: "PREMIUM",
  },
  {
    provider: AIProvider.CLOUDFLARE,
    modelKey: "cloudflare-qwen3-pin-drafts",
    modelId: "@cf/qwen/qwen3-30b-a3b-fp8",
    displayName: "Cloudflare Qwen3 30B",
    capability: AITaskType.PIN_DRAFTS,
    status: AIModelStatus.ACTIVE,
    isDefault: true,
    costTier: "LOW_COST",
  },
  {
    provider: AIProvider.MOCK,
    modelKey: "mock-pin-drafts",
    modelId: "mock-drafts",
    displayName: "Mock (test only)",
    capability: AITaskType.PIN_DRAFTS,
    status: AIModelStatus.ACTIVE,
    isDefault: false,
    costTier: "LOW_COST",
  },
  // Image Prompt
  {
    provider: AIProvider.GEMINI,
    modelKey: "gemini-flash-image-prompt",
    modelId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    capability: AITaskType.IMAGE_PROMPT,
    status: AIModelStatus.ACTIVE,
    isDefault: false,
    costTier: "PREMIUM",
  },
  {
    provider: AIProvider.CLOUDFLARE,
    modelKey: "cloudflare-qwen3-image-prompt",
    modelId: "@cf/qwen/qwen3-30b-a3b-fp8",
    displayName: "Cloudflare Qwen3 30B",
    capability: AITaskType.IMAGE_PROMPT,
    status: AIModelStatus.ACTIVE,
    isDefault: true,
    costTier: "LOW_COST",
  },
  // Board Recommendation (disabled — not yet implemented)
  {
    provider: AIProvider.GEMINI,
    modelKey: "gemini-flash-board-rec",
    modelId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    capability: AITaskType.BOARD_RECOMMENDATION,
    status: AIModelStatus.DISABLED,
    isDefault: true,
  },
  // Analytics Recommendation (disabled — not yet implemented)
  {
    provider: AIProvider.GEMINI,
    modelKey: "gemini-flash-analytics-rec",
    modelId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    capability: AITaskType.ANALYTICS_RECOMMENDATION,
    status: AIModelStatus.DISABLED,
    isDefault: true,
  },
  // Premium Image Models (disabled — require separate API keys / pricing verification)
  {
    provider: AIProvider.OPENAI,
    modelKey: "openai-gpt-image-2",
    modelId: "gpt-image-2",
    displayName: "OpenAI GPT Image 2",
    capability: AITaskType.IMAGE_PROMPT,
    status: AIModelStatus.DISABLED,
    isDefault: false,
    costTier: "PREMIUM",
  },
  {
    provider: AIProvider.OPENAI,
    modelKey: "recraftv4-pro-design",
    modelId: "recraft/recraftv4-pro",
    displayName: "Recraft V4 Pro (Design)",
    capability: AITaskType.IMAGE_PROMPT,
    status: AIModelStatus.DISABLED,
    isDefault: false,
    costTier: "PREMIUM",
  },
  {
    provider: AIProvider.OPENAI,
    modelKey: "recraftv4-pro-vector",
    modelId: "recraft/recraftv4-pro-vector",
    displayName: "Recraft V4 Pro (SVG/Vector)",
    capability: AITaskType.IMAGE_PROMPT,
    status: AIModelStatus.DISABLED,
    isDefault: false,
    costTier: "PREMIUM",
  },
  {
    provider: AIProvider.OPENAI,
    modelKey: "seedream-5-lite",
    modelId: "seedream-5-lite",
    displayName: "Seedream 5 Lite",
    capability: AITaskType.IMAGE_PROMPT,
    status: AIModelStatus.DISABLED,
    isDefault: false,
    costTier: "PREMIUM",
  },
  // Future text providers (disabled)
  {
    provider: AIProvider.OPENROUTER,
    modelKey: "openrouter-claude",
    modelId: "anthropic/claude-3.5-sonnet",
    displayName: "Claude 3.5 Sonnet (OpenRouter)",
    capability: AITaskType.CONTENT_IDEAS,
    status: AIModelStatus.DISABLED,
    isDefault: false,
  },
  {
    provider: AIProvider.OPENROUTER,
    modelKey: "openrouter-gpt",
    modelId: "openai/gpt-4o",
    displayName: "GPT-4o (OpenRouter)",
    capability: AITaskType.PIN_DRAFTS,
    status: AIModelStatus.DISABLED,
    isDefault: false,
  },
  {
    provider: AIProvider.DEEPSEEK,
    modelKey: "deepseek-chat",
    modelId: "deepseek-chat",
    displayName: "DeepSeek Chat",
    capability: AITaskType.CONTENT_IDEAS,
    status: AIModelStatus.DISABLED,
    isDefault: false,
  },
];

export function getModelsByCapability(capability: AITaskType): ModelRegistryEntry[] {
  return defaultModels.filter((m) => m.capability === capability);
}

export function getModelByKey(modelKey: string): ModelRegistryEntry | undefined {
  return defaultModels.find((m) => m.modelKey === modelKey);
}

export function getDefaultModelForTask(capability: AITaskType): ModelRegistryEntry {
  const model = defaultModels.find((m) => m.capability === capability && m.isDefault);
  if (!model) {
    throw new Error(`No default model configured for task: ${capability}`);
  }
  return model;
}

export { defaultModels };
