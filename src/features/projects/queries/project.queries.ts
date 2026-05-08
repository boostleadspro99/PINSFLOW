import { prisma } from "@/lib/prisma";
import { Project } from "@prisma/client";

export async function getUserProjects(userId: string): Promise<Project[]> {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProjectById(userId: string, projectId: string): Promise<Project | null> {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });
}

export async function getActiveUserProjects(userId: string): Promise<Project[]> {
  return prisma.project.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: { updatedAt: "desc" },
  });
}
