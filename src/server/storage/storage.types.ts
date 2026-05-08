export type StorageProviderType = "MOCK" | "CLOUDINARY" | "R2" | "EXTERNAL_URL" | "LOCAL_PLACEHOLDER";

export interface UploadResult {
  url: string;
  provider: StorageProviderType;
  width?: number;
  height?: number;
}

export interface StorageProvider {
  upload(options: { imageData: string | Buffer; filename: string; mimeType?: string }): Promise<UploadResult>;
}

export interface StorageClient {
  getProvider(): StorageProvider;
  getProviderType(): StorageProviderType;
  upload(imageData: string | Buffer, filename: string): Promise<UploadResult>;
}
