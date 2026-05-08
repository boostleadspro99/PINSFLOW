import { StorageClient, StorageProvider, UploadResult, StorageProviderType } from "./storage.types";
import { MockStorageProvider } from "./providers/mock-storage.provider";
import { R2StorageProvider, isR2Configured } from "./providers/r2-storage.provider";

function createStorageProvider(): { provider: StorageProvider; type: StorageProviderType } {
  if (isR2Configured()) {
    return {
      provider: new R2StorageProvider(),
      type: "R2",
    };
  }

  return {
    provider: new MockStorageProvider(),
    type: "MOCK",
  };
}

class StorageClientImpl implements StorageClient {
  private provider: StorageProvider;
  private providerType: StorageProviderType;

  constructor(provider: StorageProvider, providerType: StorageProviderType) {
    this.provider = provider;
    this.providerType = providerType;
  }

  getProvider(): StorageProvider {
    return this.provider;
  }

  getProviderType(): StorageProviderType {
    return this.providerType;
  }

  async upload(imageData: string | Buffer, filename: string): Promise<UploadResult> {
    const result = await this.provider.upload({ imageData, filename });
    return { ...result, provider: this.providerType };
  }
}

let clientInstance: StorageClient | null = null;

export function getStorageClient(): StorageClient {
  if (!clientInstance) {
    const { provider, type } = createStorageProvider();
    clientInstance = new StorageClientImpl(provider, type);
  }
  return clientInstance;
}
