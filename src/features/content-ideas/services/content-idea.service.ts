import "server-only";
import { prisma } from "@/lib/prisma";
import { AiContentIdea } from "@/server/ai/ai.types";
import { ContentIdeaFormat } from "@prisma/client";
import { UpdateContentIdeaStatusInput } from "../schemas/content-idea.schema";

export const contentIdeaService = {
  saveGeneratedIdeas: async (
    projectId: string,
    keywordId: string,
    ideas: AiContentIdea[]
  ) => {
    const data = ideas.map((idea) => ({
      projectId,
      keywordId,
      title: idea.title,
      angle: idea.angle,
      audience: idea.audience || null,
      format: idea.format as ContentIdeaFormat,
      aiScore: idea.aiScore,
      status: "DRAFT" as const,
    }));

    return prisma.contentIdea.createMany({
      data,
    });
  },

  updateStatus: async (userId: string, data: UpdateContentIdeaStatusInput) => {
    // Check ownership
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId }
    });
    if (!project) throw new Error("Project not found or unauthorized");

    return prisma.contentIdea.update({
      where: { id: data.ideaId, projectId: data.projectId },
      data: { status: data.status }
    });
  }
};
