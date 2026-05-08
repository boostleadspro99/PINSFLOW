import { StorageProvider, UploadResult } from "../storage.types";

export class CloudinaryStorageProvider implements StorageProvider {
  async upload(_options: { imageData: string | Buffer; filename: string; mimeType?: string }): Promise<UploadResult> {
    // Cloudinary SDK integration placeholder.
    // Will be implemented in a later phase when Cloudinary env vars are configured.
    throw new Error("Cloudinary provider not yet implemented. Use MOCK or EXTERNAL_URL instead.");
  }
}
