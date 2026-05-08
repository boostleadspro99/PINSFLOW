import { PublishProvider } from "@prisma/client";
import { PublishingProvider } from "./publishing.types";
import { DirectPinterestProvider } from "./providers/direct-pinterest.provider";
import { MakeWebhookProvider } from "./providers/make-webhook.provider";

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

registerProvider(new DirectPinterestProvider());
registerProvider(new MakeWebhookProvider());
