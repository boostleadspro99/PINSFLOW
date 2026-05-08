import { ImageGenerationProvider, AIImageProviderType } from "./image-generation.types";
import { MockImageProvider } from "./providers/mock-image.provider";
import { CloudflareImageProvider } from "./providers/cloudflare-image.provider";
import { isCloudflareConfigured } from "./cloudflare/cloudflare-ai-client";

function createImageGenerationProvider(): { provider: ImageGenerationProvider; type: AIImageProviderType } {
  // Use Cloudflare if configured
  if (isCloudflareConfigured()) {
    return {
      provider: new CloudflareImageProvider(),
      type: "CLOUDFLARE",
    };
  }

  // Fall back to mock
  return {
    provider: new MockImageProvider(),
    type: "MOCK",
  };
}

let providerInstance: { provider: ImageGenerationProvider; type: AIImageProviderType } | null = null;

export function getImageGenerationProvider(): { provider: ImageGenerationProvider; type: AIImageProviderType } {
  if (!providerInstance) {
    providerInstance = createImageGenerationProvider();
  }
  return providerInstance;
}

export type { ImageGenerationProvider, GenerateImageInput, ImageGenerationResult } from "./image-generation.types";
