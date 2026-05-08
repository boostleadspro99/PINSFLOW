export type AIImageProviderType = "MOCK" | "GEMINI" | "CLOUDFLARE" | "OPENAI" | "REPLICATE" | "MANUAL";

export interface GenerateImageInput {
  prompt: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResult {
  url: string;
  provider: AIImageProviderType;
  prompt: string;
}

export interface ImageGenerationProvider {
  generate(input: GenerateImageInput): Promise<ImageGenerationResult>;
}
