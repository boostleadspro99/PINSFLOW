import { PublishProvider } from "@prisma/client";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { PublishingProvider, PublishPayload, PublishResult } from "../publishing.types";

export class MakeWebhookProvider implements PublishingProvider {
  readonly provider = PublishProvider.MAKE;

  async publish(payload: PublishPayload): Promise<PublishResult> {
    const webhookUrl = env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      return { success: false, error: "MAKE_WEBHOOK_URL is not configured." };
    }

    const secret = env.MAKE_WEBHOOK_SECRET;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (secret) {
      headers["Authorization"] = `Bearer ${secret}`;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          publishJobId: payload.publishJobId,
          projectId: payload.projectId,
          pinDraftId: payload.pinDraftId,
          pinAssetId: payload.pinAssetId,
          title: payload.title,
          description: payload.description,
          imageUrl: payload.imageUrl,
          targetUrl: payload.targetUrl,
          boardId: payload.boardId,
          boardName: payload.boardName,
          idempotencyKey: payload.idempotencyKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        logger.error("Make webhook returned error", {
          status: response.status,
          error: errorText.slice(0, 200),
        });
        return { success: false, error: `Make webhook returned status ${response.status}` };
      }

      const result = await response.json().catch(() => ({}));

      logger.info("Pin sent to Make webhook successfully", {
        publishJobId: payload.publishJobId,
        pinDraftId: payload.pinDraftId,
      });

      return {
        success: true,
        externalPinId: result.externalPinId ?? result.pinId ?? undefined,
        externalUrl: result.externalUrl ?? undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logger.error("Make webhook request failed", { error: message });
      return { success: false, error: `Make webhook request failed: ${message}` };
    }
  }
}
