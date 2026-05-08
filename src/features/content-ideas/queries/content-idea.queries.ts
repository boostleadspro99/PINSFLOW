import { prisma } from "@/lib/prisma";
import { ContentIdea, Keyword, PinDraft } from "@prisma/client";

export type ContentIdeaWithKeywordAndDraft = ContentIdea & { keyword: Keyword; pinDraft: PinDraft | null };

export async function getProjectContentIdeas(userId: string, projectId: string): Promise<ContentIdeaWithKeywordAndDraft[]> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!project) return [];

  return prisma.contentIdea.findMany({
    where: { projectId },
    include: { keyword: true, pinDraft: true },
    orderBy: { createdAt: "desc" }
  });
}
