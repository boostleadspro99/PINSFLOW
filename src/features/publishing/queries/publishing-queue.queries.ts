import { prisma } from "@/lib/prisma";

/**
 * Count queued jobs for a project (for UI badge display).
 */
export async function getQueuedJobCount(projectId: string): Promise<number> {
  return prisma.publishJob.count({
    where: { projectId, status: "QUEUED" },
  });
}

/**
 * Count all non-terminal jobs for a user (for queue status).
 */
export async function getActiveJobCount(userId: string): Promise<number> {
  return prisma.publishJob.count({
    where: {
      userId,
      status: { in: ["QUEUED", "SENDING"] },
    },
  });
}
