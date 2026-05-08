import { prisma } from "@/lib/prisma";

export async function getPublishJobsByProject(userId: string, projectId: string) {
  return prisma.publishJob.findMany({
    where: {
      userId,
      projectId,
    },
    include: {
      pinDraft: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishJobById(userId: string, publishJobId: string) {
  return prisma.publishJob.findFirst({
    where: { id: publishJobId, userId },
    include: {
      pinDraft: { select: { title: true } },
    },
  });
}

export async function getPublishJobByIdempotencyKey(userId: string, idempotencyKey: string) {
  return prisma.publishJob.findUnique({
    where: { idempotencyKey },
    include: {
      pinDraft: { select: { title: true } },
    },
  });
}

export async function getPublishJobByIdempotencyKeyOnly(idempotencyKey: string) {
  return prisma.publishJob.findUnique({
    where: { idempotencyKey },
  });
}
