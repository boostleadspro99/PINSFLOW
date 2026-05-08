import { prisma } from "@/lib/prisma";
import { PinAssetWithRelations, PinAssetWithDraftAndProject } from "../types/pin-asset.types";

export async function getPinAssetById(userId: string, pinAssetId: string): Promise<PinAssetWithDraftAndProject | null> {
  const asset = await prisma.pinAsset.findUnique({
    where: { id: pinAssetId },
    include: {
      pinDraft: {
        include: { project: true }
      }
    }
  });

  if (!asset || asset.pinDraft?.project.userId !== userId) return null;

  return asset;
}

export async function getPinAssetsByProjectId(userId: string, projectId: string): Promise<PinAssetWithRelations[]> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });
  if (!project) return [];

  return prisma.pinAsset.findMany({
    where: {
      pinDraft: { projectId }
    },
    include: { pinDraft: true },
    orderBy: { createdAt: "desc" }
  });
}
