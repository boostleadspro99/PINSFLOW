import { prisma } from "@/lib/prisma";
import { GeminiProvider } from "@/server/ai";
import { resolveModelForTask } from "@/server/ai/ai-client";
import { AITaskType } from "@prisma/client";
import { pinDraftSchema } from "../schemas/pin-draft.schemas";

const ai = new GeminiProvider();

export async function createPinDraft(userId: string, ideaId: string, projectId: string) {
  const idea = await prisma.contentIdea.findFirst({
    where: { id: ideaId, projectId },
    include: { keyword: true, project: true }
  });

  if (!idea || idea.project.userId !== userId) {
    throw new Error("Content idea not found or unauthorized");
  }

  // Resolve model from project AI settings
  const resolved = await resolveModelForTask(projectId, AITaskType.PIN_DRAFTS);

  const aiDraft = await resolved.provider.generatePinDraft({
    projectName: idea.project.name,
    projectDescription: idea.project.description,
    keyword: idea.keyword.term,
    ideaTitle: idea.title,
    ideaAngle: idea.angle,
    ideaFormat: idea.format,
  });

  const validatedData = pinDraftSchema.parse(aiDraft);

  return prisma.pinDraft.create({
    data: {
      projectId,
      keywordId: idea.keywordId,
      contentIdeaId: idea.id,
      ...validatedData,
    }
  });
}

export async function updatePinDraftStatus(userId: string, pinDraftId: string, status: "APPROVED" | "ARCHIVED") {
  const pinDraft = await prisma.pinDraft.findUnique({
    where: { id: pinDraftId },
    include: { project: true }
  });

  if (!pinDraft || pinDraft.project.userId !== userId) {
     throw new Error("Pin draft not found or unauthorized");
  }

  return prisma.pinDraft.update({
    where: { id: pinDraftId },
    data: { status }
  });
}
