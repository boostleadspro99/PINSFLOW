import { ImageGenerationProvider, GenerateImageInput, ImageGenerationResult } from "../image-generation.types";

export class MockImageProvider implements ImageGenerationProvider {
  async generate(input: GenerateImageInput): Promise<ImageGenerationResult> {
    const seed = encodeURIComponent(input.prompt.slice(0, 50));
    const width = input.width ?? 1000;
    const height = input.height ?? 1500;
    const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;

    return {
      url,
      provider: "MOCK",
      prompt: input.prompt,
    };
  }
}
