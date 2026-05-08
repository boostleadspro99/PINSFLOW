import { PublishProvider } from "@prisma/client";
import { PublishingProvider } from "./publishing.types";
import { DirectPinterestProvider } from "./providers/direct-pinterest.provider";

const providers = new Map<PublishProvider, PublishingProvider>();

export function registerProvider(provider: PublishingProvider): void {
  providers.set(provider.provider, provider);
}

export function getProvider(provider: PublishProvider): PublishingProvider {
  const instance = providers.get(provider);
  if (!instance) {
    throw new Error(`No publishing provider registered for: ${provider}`);
  }
  return instance;
}

// Direct Pinterest is the only active publishing provider
registerProvider(new DirectPinterestProvider());
