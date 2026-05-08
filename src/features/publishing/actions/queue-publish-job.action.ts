"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { publishSchema } from "../schemas/publishing.schema";
import { queuePublishJob } from "../services/publishing-queue.service";

const queueFormSchema = publishSchema.extend({
  scheduledAt: z.string().optional(),
});

export async function queuePublishJobAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const raw = {
    pinDraftId: formData.get("pinDraftId"),
    pinAssetId: formData.get("pinAssetId"),
    projectId: formData.get("projectId"),
    boardId: formData.get("boardId"),
    boardName: formData.get("boardName") || null,
    title: formData.get("title"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    targetUrl: formData.get("targetUrl") || null,
    provider: formData.get("provider") || "DIRECT_PINTEREST",
    scheduledAt: formData.get("scheduledAt") || undefined,
  };

  const parsed = queueFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { pinDraftId, pinAssetId, projectId, boardId, boardName, title, description, imageUrl, targetUrl, provider, scheduledAt } = parsed.data;

  // Check project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) {
    return { success: false as const, error: "Project not found" };
  }

  // Check PinDraft exists, belongs to user's project, and is APPROVED
  const pinDraft = await prisma.pinDraft.findFirst({
    where: { id: pinDraftId, projectId, status: "APPROVED" },
    include: { pinAsset: true },
  });
  if (!pinDraft) {
    return { success: false as const, error: "Pin draft not found or not approved" };
  }

  // Check PinAsset belongs to this draft and is READY
  const pinAsset = await prisma.pinAsset.findFirst({
    where: { id: pinAssetId, pinDraftId, status: "READY" },
  });
  if (!pinAsset) {
    return { success: false as const, error: "Image asset not found or not ready" };
  }

  const result = await queuePublishJob(
    {
      userId: session.user.id,
      projectId,
      pinDraftId,
      pinAssetId,
      title,
      description,
      imageUrl,
      targetUrl: targetUrl ?? null,
      boardId,
      boardName: boardName ?? null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    },
    provider,
  );

  revalidatePath(`/dashboard/projects/${projectId}/pins`);
  return result;
}
