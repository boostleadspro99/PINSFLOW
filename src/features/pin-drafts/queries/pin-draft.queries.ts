import { prisma } from "@/lib/prisma";
import { PinDraftWithRelations } from "../types/pin-draft.types";

export async function getProjectPinDrafts(userId: string, projectId: string): Promise<PinDraftWithRelations[]> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });
  if (!project) return [];

  return prisma.pinDraft.findMany({
    where: { projectId },
    include: { keyword: true, contentIdea: true, pinAsset: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPinDraftById(userId: string, pinDraftId: string): Promise<PinDraftWithRelations | null> {
  const pinDraft = await prisma.pinDraft.findUnique({
    where: { id: pinDraftId },
    include: { keyword: true, contentIdea: true, project: true }
  });
  
  if (!pinDraft || pinDraft.project.userId !== userId) return null;
  
  return pinDraft;
}
