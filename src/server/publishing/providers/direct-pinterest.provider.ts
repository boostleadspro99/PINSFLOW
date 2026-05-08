import { PublishProvider } from "@prisma/client";
import { logger } from "@/lib/logger";
import { pinterestApiFetch } from "@/server/pinterest/pinterest-client";
import { PinterestApiError, PinterestRateLimitError } from "@/server/pinterest/pinterest.errors";
import { PublishingProvider, PublishPayload, PublishResult } from "../publishing.types";

export class DirectPinterestProvider implements PublishingProvider {
  readonly provider = PublishProvider.DIRECT_PINTEREST;

  async publish(payload: PublishPayload): Promise<PublishResult> {
    const { accessToken, boardId, title, description, imageUrl, targetUrl } = payload;

    if (!accessToken) {
      return { success: false, error: "Pinterest access token is missing. Please reconnect your account." };
    }

    const body: Record<string, unknown> = {
      board_id: boardId,
      title,
      description,
      media_source: {
        source_type: "image_url",
        url: imageUrl,
      },
    };

    if (targetUrl) {
      body.link = targetUrl;
    }

    try {
      const response = await pinterestApiFetch<{ id: string; link?: string }>("/pins", {
        method: "POST",
        body,
        accessToken,
      });

      logger.info("Pin published directly to Pinterest", {
        pinId: response.id,
        boardId,
      });

      return {
        success: true,
        externalPinId: response.id,
        externalUrl: response.link ?? undefined,
      };
    } catch (err) {
      if (err instanceof PinterestRateLimitError) {
        return { success: false, error: "Pinterest rate limit reached. Please try again later." };
      }

      const message = err instanceof PinterestApiError
        ? `Pinterest API error: ${err.message}`
        : err instanceof Error ? err.message : "Unknown error";

      logger.error("Direct Pinterest publish failed", { error: message });

      return { success: false, error: message };
    }
  }
}
