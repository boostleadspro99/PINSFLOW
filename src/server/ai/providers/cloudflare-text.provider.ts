import { env } from "@/lib/env";
import { AiProvider, GenerateContentIdeasInput, AiContentIdea, GeneratePinDraftInput, AiPinDraft } from "../ai.types";
import { buildContentIdeasPrompt } from "../prompts/content-ideas.prompt";
import { buildPinDraftPrompt } from "../prompts/pin-draft.prompt";
import { runCloudflareTextModel, isCloudflareConfigured } from "../cloudflare/cloudflare-ai-client";

function getTextModel(): string {
  return env.CLOUDFLARE_AI_TEXT_MODEL || "@cf/qwen/qwen3-30b-a3b-fp8";
}

function extractJson(text: string): string {
  // Try code blocks first (Gemini-style)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // Track brace depth to find the first complete valid JSON object
  // Qwen often embeds JSON within conversational text
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        const candidate = text.slice(start, i + 1);
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          // Not valid JSON at this depth — continue scanning
        }
      }
    }
  }

  // Fallback for array-only responses
  let arrDepth = 0;
  let arrStart = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "[") {
      if (arrDepth === 0) arrStart = i;
      arrDepth++;
    } else if (ch === "]") {
      arrDepth--;
      if (arrDepth === 0 && arrStart !== -1) {
        const candidate = text.slice(arrStart, i + 1);
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          // continue
        }
      }
    }
  }

  // Last resort: try to parse the whole trimmed text
  const trimmed = text.trim();
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    // Not valid JSON either
  }

  // Try to fix common issues: single quotes, trailing commas, missing quotes around keys
  try {
    const fixed = trimmed
      .replace(/'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1');
    JSON.parse(fixed);
    return fixed;
  } catch {
    // Give up
  }

  return trimmed;
}

export class CloudflareTextProvider implements AiProvider {
  async generateContentIdeas(input: GenerateContentIdeasInput): Promise<AiContentIdea[]> {
    if (!isCloudflareConfigured()) {
      throw new Error("Cloudflare AI is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.");
    }

    const prompt = buildContentIdeasPrompt(input);
    const model = getTextModel();
    const response = await runCloudflareTextModel(model, prompt);

    if (!response) {
      throw new Error("Cloudflare AI text generation returned no response.");
    }

    try {
      const cleaned = extractJson(response);
      const parsed = JSON.parse(cleaned);
      const ideas = parsed.ideas || parsed;
      if (Array.isArray(ideas)) {
        return ideas as AiContentIdea[];
      }
      throw new Error("Unexpected response format from Cloudflare AI.");
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(
          `Failed to parse Cloudflare AI response as JSON. Raw response (first 300 chars): ${JSON.stringify(response?.slice(0, 300))}`,
        );
      }
      throw err;
    }
  }

  async generatePinDraft(input: GeneratePinDraftInput): Promise<AiPinDraft> {
    if (!isCloudflareConfigured()) {
      throw new Error("Cloudflare AI is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.");
    }

    const prompt = buildPinDraftPrompt(input);
    const model = getTextModel();
    const response = await runCloudflareTextModel(model, prompt);

    if (!response) {
      throw new Error("Cloudflare AI text generation returned no response.");
    }

    try {
      const cleaned = extractJson(response);
      const parsed = JSON.parse(cleaned);
      return {
        title: parsed.title || "",
        description: parsed.description || "",
        overlayText: parsed.overlayText || "",
        imagePrompt: parsed.imagePrompt || "",
        hashtags: parsed.hashtags || "",
        targetUrl: parsed.targetUrl,
      } as AiPinDraft;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(
          `Failed to parse Cloudflare AI response as JSON. Raw response (first 300 chars): ${JSON.stringify(response?.slice(0, 300))}`,
        );
      }
      throw err;
    }
  }

  async isAvailable(): Promise<boolean> {
    return isCloudflareConfigured();
  }
}
