import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ImageGenerationProvider, GenerateImageInput, ImageGenerationResult } from "../image-generation.types";
import { runCloudflareImageModel, isCloudflareConfigured } from "../cloudflare/cloudflare-ai-client";
import { getStorageClient } from "@/server/storage/storage-client";

function getImageModel(): string {
  return env.CLOUDFLARE_AI_IMAGE_MODEL || "@cf/black-forest-labs/flux-2-klein-4b";
}

export class CloudflareImageProvider implements ImageGenerationProvider {
  async generate(input: GenerateImageInput): Promise<ImageGenerationResult> {
    if (!isCloudflareConfigured()) {
      throw new Error("Cloudflare AI is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.");
    }

    const model = getImageModel();
    const imageBuffer = await runCloudflareImageModel(model, input.prompt);

    if (!imageBuffer) {
      throw new Error("Cloudflare AI image generation returned no data.");
    }

    // Try to store the generated image and get a public URL
    let imageUrl: string | null = null;
    try {
      const filename = `cloudflare-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
      const uploadResult = await getStorageClient().upload(imageBuffer, filename);
      imageUrl = uploadResult.url;
    } catch (err) {
      logger.warn("Failed to store Cloudflare-generated image in storage provider", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }

    // If storage failed (mock provider), use a placeholder
    if (!imageUrl) {
      const width = input.width ?? 1000;
      const height = input.height ?? 1500;
      const seed = encodeURIComponent(input.prompt.slice(0, 50));
      imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
    }

    return {
      url: imageUrl,
      provider: "CLOUDFLARE",
      prompt: input.prompt,
    };
  }
}
