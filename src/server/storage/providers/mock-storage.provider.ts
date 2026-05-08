import { StorageProvider } from "../storage.types";

export class MockStorageProvider implements StorageProvider {
  async upload(options: { imageData: string | Buffer; filename: string; mimeType?: string }): Promise<{ url: string; provider: "MOCK" }> {
    const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(options.filename)}/1000/1500`;
    return { url: placeholderUrl, provider: "MOCK" };
  }
}
