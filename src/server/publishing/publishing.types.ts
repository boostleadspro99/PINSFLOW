import { PublishProvider } from "@prisma/client";

export interface PublishPayload {
  publishJobId: string;
  projectId: string;
  pinDraftId: string;
  pinAssetId: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl?: string | null;
  boardId: string;
  boardName?: string | null;
  idempotencyKey: string;
  /** Access token for direct Pinterest API calls — set only by DirectPinterestProvider flow */
  accessToken?: string;
}

export interface PublishResult {
  success: boolean;
  externalPinId?: string;
  externalUrl?: string;
  error?: string;
}

export interface PublishingProvider {
  readonly provider: PublishProvider;
  publish(payload: PublishPayload): Promise<PublishResult>;
}
