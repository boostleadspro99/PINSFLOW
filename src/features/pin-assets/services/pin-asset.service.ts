import { prisma } from "@/lib/prisma";
import { PinAssetStatus } from "@prisma/client";
import { getImageGenerationProvider } from "@/server/ai/image-generation-client";
import { getStorageClient } from "@/server/storage/storage-client";
import { DEFAULT_PIN_WIDTH, DEFAULT_PIN_HEIGHT } from "../utils/image-dimensions";

export async function generatePinAsset(userId: string, pinDraftId: string, projectId: string) {
  const pinDraft = await prisma.pinDraft.findFirst({
    where: { id: pinDraftId, projectId },
    include: { project: true }
  });

  if (!pinDraft || pinDraft.project.userId !== userId) {
    throw new Error("Pin draft not found or unauthorized");
  }

  if (pinDraft.status !== "APPROVED") {
    throw new Error("Pin draft must be APPROVED before generating an image");
  }

  if (!pinDraft.imagePrompt) {
    throw new Error("Pin draft has no image prompt");
  }

  const existingAsset = await prisma.pinAsset.findUnique({
    where: { pinDraftId }
  });

  if (existingAsset && existingAsset.status === "READY") {
    throw new Error("This pin draft already has a ready image asset");
  }

  const { provider, type } = getImageGenerationProvider();

  const result = await provider.generate({
    prompt: pinDraft.imagePrompt,
    width: DEFAULT_PIN_WIDTH,
    height: DEFAULT_PIN_HEIGHT,
  });

  // Get the active storage provider type
  const storageClient = getStorageClient();
  const storageProviderName = storageClient.getProviderType();

  return prisma.pinAsset.upsert({
    where: { pinDraftId },
    update: {
      imageUrl: result.url,
      storageProvider: storageProviderName,
      aiProvider: type,
      prompt: result.prompt,
      width: DEFAULT_PIN_WIDTH,
      height: DEFAULT_PIN_HEIGHT,
      status: PinAssetStatus.READY,
    },
    create: {
      pinDraftId,
      imageUrl: result.url,
      storageProvider: storageProviderName,
      aiProvider: type,
      prompt: result.prompt,
      width: DEFAULT_PIN_WIDTH,
      height: DEFAULT_PIN_HEIGHT,
      status: PinAssetStatus.READY,
    }
  });
}

export async function attachPinAssetUrl(userId: string, pinDraftId: string, projectId: string, imageUrl: string) {
  const pinDraft = await prisma.pinDraft.findFirst({
    where: { id: pinDraftId, projectId },
    include: { project: true }
  });

  if (!pinDraft || pinDraft.project.userId !== userId) {
    throw new Error("Pin draft not found or unauthorized");
  }

  const existingAsset = await prisma.pinAsset.findUnique({
    where: { pinDraftId }
  });

  if (existingAsset && existingAsset.status !== "ARCHIVED") {
    throw new Error("This pin draft already has an active image asset. Archive it first.");
  }

  return prisma.pinAsset.upsert({
    where: { pinDraftId },
    update: {
      imageUrl,
      storageProvider: "EXTERNAL_URL",
      aiProvider: "MANUAL",
      status: PinAssetStatus.READY,
    },
    create: {
      pinDraftId,
      imageUrl,
      storageProvider: "EXTERNAL_URL",
      aiProvider: "MANUAL",
      status: PinAssetStatus.READY,
    }
  });
}

export async function archivePinAsset(userId: string, pinAssetId: string, projectId: string) {
  const asset = await prisma.pinAsset.findUnique({
    where: { id: pinAssetId },
    include: {
      pinDraft: { include: { project: true } }
    }
  });

  if (!asset || asset.pinDraft?.project.userId !== userId) {
    throw new Error("Pin asset not found or unauthorized");
  }

  return prisma.pinAsset.update({
    where: { id: pinAssetId },
    data: { status: PinAssetStatus.ARCHIVED }
  });
}
