"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveModelForTask } from "@/server/ai/ai-client";
import { AITaskType, PublishProvider } from "@prisma/client";
import type { AiContentIdea } from "@/server/ai/ai.types";
import { logger } from "@/lib/logger";
import { queuePublishJob } from "../services/publishing-queue.service";
import { env } from "@/lib/env";
import { getImageGenerationProvider } from "@/server/ai/image-generation-client";
import { getStorageClient } from "@/server/storage/storage-client";

export interface BatchResult {
  success: boolean;
  ideasGenerated: number;
  draftsCreated: number;
  imagesGenerated: number;
  jobsQueued: number;
  errors: string[];
  error?: string;
}

export async function generateBatchAction(
  projectId: string,
  keywordId: string,
  count: number = 3,
): Promise<BatchResult> {
  const result: BatchResult = {
    success: false,
    ideasGenerated: 0,
    draftsCreated: 0,
    imagesGenerated: 0,
    jobsQueued: 0,
    errors: [],
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { ...result, error: "Not authenticated" };
    }

    const userId = session.user.id;

    // Verify project + keyword ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) return { ...result, error: "Project not found" };

    const keyword = await prisma.keyword.findFirst({
      where: { id: keywordId, projectId },
    });
    if (!keyword) return { ...result, error: "Keyword not found" };

    const publishProvider = env.MAKE_WEBHOOK_URL
      ? PublishProvider.MAKE
      : PublishProvider.DIRECT_PINTEREST;

    // Step 1: Generate content ideas
    const { provider: textProvider } = await resolveModelForTask(projectId, AITaskType.CONTENT_IDEAS);

    let ideas: AiContentIdea[] = [];

    try {
      ideas = await textProvider.generateContentIdeas({
        projectName: project.name,
        projectDescription: project.description,
        targetAudience: project.targetAudience,
        keyword: keyword.term,
        count: Math.min(count, 5),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI generation failed";
      logger.error("Batch: content ideas generation failed", { error: msg });
      return { ...result, error: `Failed to generate content ideas: ${msg}` };
    }

    if (ideas.length === 0) {
      return { ...result, error: "AI returned no content ideas" };
    }

    // Save ideas individually (createMany doesn't return records in this Prisma version)
    const ideaIds: string[] = [];
    for (const idea of ideas) {
      const record = await prisma.contentIdea.create({
        data: {
          projectId,
          keywordId,
          title: idea.title,
          angle: idea.angle,
          audience: idea.audience || null,
          format: idea.format as any,
          aiScore: idea.aiScore,
          status: "DRAFT",
        },
      });
      ideaIds.push(record.id);
    }

    result.ideasGenerated = ideaIds.length;

    // Step 2 & 3: For each idea → create draft + generate image + queue
    const savedIdeas = await prisma.contentIdea.findMany({
      where: { id: { in: ideaIds } },
    });

    for (const idea of savedIdeas) {
      try {
        // Approve idea
        await prisma.contentIdea.update({
          where: { id: idea.id },
          data: { status: "APPROVED" },
        });

        // Generate pin draft via AI
        const { provider: draftProvider } = await resolveModelForTask(projectId, AITaskType.PIN_DRAFTS);
        const aiDraft = await draftProvider.generatePinDraft({
          projectName: project.name,
          projectDescription: project.description,
          keyword: keyword.term,
          ideaTitle: idea.title,
          ideaAngle: idea.angle,
          ideaFormat: idea.format,
        });

        // Create the Draft record
        const draft = await prisma.pinDraft.create({
          data: {
            projectId,
            keywordId,
            contentIdeaId: idea.id,
            title: aiDraft.title,
            description: aiDraft.description,
            overlayText: aiDraft.overlayText,
            imagePrompt: aiDraft.imagePrompt,
            hashtags: aiDraft.hashtags,
            targetUrl: aiDraft.targetUrl || project.defaultWebsiteUrl,
            status: "DRAFT",
          },
        });
        result.draftsCreated++;

        // Approve draft
        await prisma.pinDraft.update({
          where: { id: draft.id },
          data: { status: "APPROVED" },
        });

        // Generate image via Cloudflare FLUX
        try {
          const imgProvider = getImageGenerationProvider();
          const imageResult = await imgProvider.provider.generate({
            prompt: aiDraft.imagePrompt,
            width: 1000,
            height: 1500,
          });

          const storageClient = getStorageClient();
          const storageProviderName = storageClient.getProviderType();

          // Save asset
          await prisma.pinAsset.upsert({
            where: { pinDraftId: draft.id },
            update: {
              imageUrl: imageResult.url,
              storageProvider: storageProviderName,
              aiProvider: imgProvider.type,
              prompt: imageResult.prompt || aiDraft.imagePrompt,
              width: 1000,
              height: 1500,
              status: "READY",
            },
            create: {
              pinDraftId: draft.id,
              imageUrl: imageResult.url,
              storageProvider: storageProviderName,
              aiProvider: imgProvider.type,
              prompt: imageResult.prompt || aiDraft.imagePrompt,
              width: 1000,
              height: 1500,
              status: "READY",
            },
          });
          result.imagesGenerated++;

          // Queue for publishing
          const board = await prisma.pinterestBoard.findFirst({
            where: { userId },
            orderBy: { lastSyncedAt: "desc" },
          });

          if (board) {
            try {
              const pinAsset = await prisma.pinAsset.findUnique({ where: { pinDraftId: draft.id } });
              if (!pinAsset) {
                result.errors.push("Asset not found after creation");
                continue;
              }

              const queueResult = await queuePublishJob(
                {
                  userId,
                  projectId,
                  pinDraftId: draft.id,
                  pinAssetId: pinAsset.id,
                  title: aiDraft.title,
                  description: aiDraft.description,
                  imageUrl: imageResult.url,
                  targetUrl: aiDraft.targetUrl || project.defaultWebsiteUrl,
                  boardId: board.pinterestBoardId,
                  boardName: board.name || null,
                },
                publishProvider,
              );

              if (queueResult.success) {
                result.jobsQueued++;
              } else {
                result.errors.push(`Failed to queue draft "${aiDraft.title.slice(0, 30)}": ${queueResult.error}`);
              }
            } catch (queueErr) {
              const msg = queueErr instanceof Error ? queueErr.message : "Queue error";
              result.errors.push(`Queue error for "${aiDraft.title.slice(0, 30)}": ${msg}`);
            }
          } else {
            result.errors.push("No Pinterest board found. Sync boards first.");
          }
        } catch (imgErr) {
          const msg = imgErr instanceof Error ? imgErr.message : "Image generation failed";
          result.errors.push(`Image generation failed for "${aiDraft.title.slice(0, 30)}": ${msg}`);
        }
      } catch (ideaErr) {
        const msg = ideaErr instanceof Error ? ideaErr.message : "Idea processing failed";
        result.errors.push(`Failed to process idea "${idea.title.slice(0, 30)}": ${msg}`);
      }
    }

    result.success = result.jobsQueued > 0;
    revalidatePath(`/dashboard/projects/${projectId}/pins`);

    logger.info("Batch generation completed", {
      userId,
      projectId,
      ideas: result.ideasGenerated,
      drafts: result.draftsCreated,
      images: result.imagesGenerated,
      queued: result.jobsQueued,
      errors: result.errors.length,
    });

    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Batch generation failed";
    logger.error("Batch generation failed", { error: msg });
    return { ...result, error: msg };
  }
}
