import "server-only";
import { prisma } from "@/lib/prisma";
import { CreateProjectInput, UpdateProjectInput } from "../schemas/project.schema";
import { generateUniqueSlug } from "../utils/project-slug";

export const projectService = {
  create: async (userId: string, data: CreateProjectInput) => {
    const slug = await generateUniqueSlug(userId, data.name);
    return prisma.project.create({
      data: {
        ...data,
        slug,
        userId,
      },
    });
  },

  update: async (userId: string, projectId: string, data: UpdateProjectInput) => {
    // Note: We don't change the slug here simply if the name changes, to keep URLs stable.
    // Ensure ownership via where clause.
    const exists = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });
    
    if (!exists) throw new Error("Project not found or unauthorized");

    return prisma.project.update({
      where: { id: projectId },
      data,
    });
  },

  archive: async (userId: string, projectId: string) => {
    const exists = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });
    
    if (!exists) throw new Error("Project not found or unauthorized");

    return prisma.project.update({
      where: { id: projectId },
      data: { status: "ARCHIVED" },
    });
  },
};
