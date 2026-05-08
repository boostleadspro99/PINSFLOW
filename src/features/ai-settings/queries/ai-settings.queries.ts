import { prisma } from "@/lib/prisma";

export async function getProjectAISettings(userId: string, projectId: string) {
  // Verify ownership first
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) return null;

  return prisma.projectAISettings.findUnique({
    where: { projectId },
  });
}
