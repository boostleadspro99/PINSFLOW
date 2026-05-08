import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { CloudflareTextResponse } from "./cloudflare-ai.types";

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  baseUrl: string;
}

function getConfig(): CloudflareConfig | null {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return null;
  }

  return {
    accountId,
    apiToken,
    baseUrl: env.CLOUDFLARE_AI_BASE_URL || "https://api.cloudflare.com/client/v4",
  };
}

export function isCloudflareConfigured(): boolean {
  return getConfig() !== null;
}

/**
 * Call a Cloudflare Workers AI text model.
 * Returns the response text, or null on failure.
 */
export async function runCloudflareTextModel(
  modelName: string,
  prompt: string,
): Promise<string | null> {
  const config = getConfig();
  if (!config) {
    logger.warn("Cloudflare AI not configured — missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
    return null;
  }

  const url = `${config.baseUrl}/accounts/${config.accountId}/ai/run/${modelName}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      logger.error("Cloudflare AI text request failed", {
        status: response.status,
        model: modelName,
        error: errorBody.slice(0, 200),
      });
      return null;
    }

    const data: CloudflareTextResponse = await response.json();

    if (!data.success) {
      const msg = data.errors?.[0]?.message ?? "Unknown error";
      logger.error("Cloudflare AI text API error", { model: modelName, error: msg });
      return null;
    }

    // Try multiple response field paths: choices[0].text, result.response, choices[0].message.content
    let text = data.result.choices?.[0]?.text;
    if (!text) {
      const resultRecord = data.result as Record<string, unknown>;
      if (typeof resultRecord.response === "string") {
        text = resultRecord.response;
      } else if (Array.isArray(resultRecord.choices)) {
        const firstChoice = resultRecord.choices[0] as Record<string, unknown> | undefined;
        const message = firstChoice?.message as Record<string, unknown> | undefined;
        if (typeof message?.content === "string") {
          text = message.content;
        }
      }
    }
    if (!text) {
      logger.warn("Cloudflare AI text response missing expected text field", {
        model: modelName,
        keys: Object.keys(data.result),
      });
      return null;
    }
    return text;
  } catch (err) {
    logger.error("Cloudflare AI text request exception", {
      model: modelName,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return null;
  }
}

/**
 * Call a Cloudflare Workers AI image model.
 * Returns the image as a Buffer, or null on failure.
 */
export async function runCloudflareImageModel(
  modelName: string,
  prompt: string,
): Promise<Buffer | null> {
  const config = getConfig();
  if (!config) {
    logger.warn("Cloudflare AI not configured — missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
    return null;
  }

  const url = `${config.baseUrl}/accounts/${config.accountId}/ai/run/${modelName}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      logger.error("Cloudflare AI image request failed", {
        status: response.status,
        model: modelName,
        error: errorBody.slice(0, 200),
      });
      return null;
    }

    const contentType = response.headers.get("content-type") || "";

    // Image models return binary data
    if (contentType.startsWith("image/")) {
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // Some models return a JSON with image data
    const json = await response.json();
    if (json?.result?.image) {
      const base64Data = json.result.image as string;
      return Buffer.from(base64Data, "base64");
    }

    // Fallback: try the raw result
    if (json?.result && typeof json.result === "object") {
      const resultObj = json.result as Record<string, unknown>;
      const imageField = resultObj.image || resultObj.data || resultObj.output;
      if (imageField && typeof imageField === "string") {
        return Buffer.from(imageField, "base64");
      }
    }

    logger.error("Cloudflare AI image: unexpected response format", { model: modelName });
    return null;
  } catch (err) {
    logger.error("Cloudflare AI image request exception", {
      model: modelName,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return null;
  }
}
