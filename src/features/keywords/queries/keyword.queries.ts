import { prisma } from "@/lib/prisma";
import { Keyword } from "@prisma/client";

export async function getProjectKeywords(userId: string, projectId: string): Promise<Keyword[]> {
  // First ensure project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!project) return [];

  return prisma.keyword.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" }
  });
}

export async function getKeywordById(userId: string, projectId: string, keywordId: string): Promise<Keyword | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!project) return null;

  return prisma.keyword.findFirst({
    where: {
      id: keywordId,
      projectId
    }
  });
}
