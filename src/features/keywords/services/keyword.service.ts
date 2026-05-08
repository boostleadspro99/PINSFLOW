import "server-only";
import { prisma } from "@/lib/prisma";
import { CreateKeywordInput, UpdateKeywordStatusInput } from "../schemas/keyword.schema";

export const keywordService = {
  create: async (userId: string, data: CreateKeywordInput) => {
    // Check if project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId }
    });
    if (!project) throw new Error("Project not found or unauthorized");

    const term = data.term.trim().toLowerCase();

    const existing = await prisma.keyword.findFirst({
      where: { projectId: data.projectId, term }
    });

    if (existing) {
      throw new Error(`Keyword '${term}' already exists in this project`);
    }

    return prisma.keyword.create({
      data: {
        projectId: data.projectId,
        term,
        searchVolume: data.searchVolume,
        difficulty: data.difficulty,
        source: "MANUAL",
      }
    });
  },

  importBulk: async (userId: string, projectId: string, terms: string[]) => {
    // Check ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });
    if (!project) throw new Error("Project not found or unauthorized");

    let addedCount = 0;
    let duplicateCount = 0;

    for (const rawTerm of terms) {
      const term = rawTerm.trim().toLowerCase();
      if (!term || term.length > 100) continue;

      const existing = await prisma.keyword.findFirst({
        where: { projectId, term }
      });

      if (!existing) {
        await prisma.keyword.create({
          data: {
            projectId,
            term,
            source: "CSV",
            status: "NEW"
          }
        });
        addedCount++;
      } else {
        duplicateCount++;
      }
    }

    return { addedCount, duplicateCount };
  },

  updateStatus: async (userId: string, data: UpdateKeywordStatusInput) => {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId }
    });
    if (!project) throw new Error("Project not found or unauthorized");

    return prisma.keyword.update({
      where: { id: data.keywordId },
      data: { status: data.status }
    });
  }
};
