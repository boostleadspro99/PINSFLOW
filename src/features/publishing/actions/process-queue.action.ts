"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processQueue } from "../services/publishing-queue.service";
import { prisma } from "@/lib/prisma";
import { PublishJobStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ProcessQueueActionResult =
  | { success: true; status: string; processedCount: number }
  | { success: false; error: string };

export async function processQueueAction(
  projectId: string,
  batchSize?: number,
): Promise<ProcessQueueActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const result = await processQueue(batchSize ?? 1);

    revalidatePath(`/dashboard/projects/${projectId}/pins`);

    if (result.processed === 0) {
      return { success: true, status: "NO_JOBS", processedCount: 0 };
    }

    const hasFailures = result.results.some((r) => r.status === "FAILED" || r.status === "QUEUED_RETRY");
    const hasSuccess = result.results.some((r) => r.status === "PUBLISHED");

    if (hasSuccess && hasFailures) {
      return { success: true, status: "PARTIAL", processedCount: result.processed };
    }
    if (hasSuccess) {
      return { success: true, status: "SUCCESS", processedCount: result.processed };
    }
    return { success: true, status: "FAILED", processedCount: result.processed };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process queue";
    return { success: false, error: message };
  }
}

export interface QueueStats {
  queued: number;
  sending: number;
  failed: number;
  published: number;
}

export async function getQueueStatsAction(projectId: string): Promise<QueueStats> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { queued: 0, sending: 0, failed: 0, published: 0 };
  }

  const [queued, sending, failed, published] = await Promise.all([
    prisma.publishJob.count({
      where: { projectId, userId: session.user.id, status: PublishJobStatus.QUEUED },
    }),
    prisma.publishJob.count({
      where: { projectId, userId: session.user.id, status: PublishJobStatus.SENDING },
    }),
    prisma.publishJob.count({
      where: { projectId, userId: session.user.id, status: PublishJobStatus.FAILED },
    }),
    prisma.publishJob.count({
      where: { projectId, userId: session.user.id, status: PublishJobStatus.PUBLISHED },
    }),
  ]);

  return { queued, sending, failed, published };
}
