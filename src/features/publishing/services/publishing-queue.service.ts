import { prisma } from "@/lib/prisma";
import { PublishJobStatus, PublishProvider } from "@prisma/client";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { systemLimits } from "@/config/limits";
import { getProvider } from "@/server/publishing/publishing-provider";
import { ensureValidAccessToken } from "@/server/pinterest/pinterest-token-refresh";
import { checkProjectDailyLimit, checkAccountHourlyLimit } from "./publishing-limits.service";
import type { PublishPayload } from "@/server/publishing/publishing.types";

const LOCK_TIMEOUT_MS = (env.PUBLISH_QUEUE_LOCK_TIMEOUT_MINUTES ?? 5) * 60 * 1000;

export interface QueuePublishJobInput {
  userId: string;
  projectId: string;
  pinDraftId: string;
  pinAssetId: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl?: string | null;
  boardId: string;
  boardName?: string | null;
  scheduledAt?: Date;
}

export interface QueuePublishJobResult {
  success: boolean;
  publishJobId?: string;
  alreadyPublished?: boolean;
  alreadyQueued?: boolean;
  error?: string;
}

export interface ProcessQueueResult {
  processed: number;
  results: Array<{
    publishJobId: string;
    status: string;
    error?: string;
  }>;
}

// ─── Frontend: queue a job ──────────────────────────────────────────

/**
 * Queue a pin for publishing. Validates idempotency, rate limits,
 * Pinterest account, scopes, board ownership, and token availability.
 */
export async function queuePublishJob(
  input: QueuePublishJobInput,
  provider: PublishProvider = PublishProvider.DIRECT_PINTEREST,
): Promise<QueuePublishJobResult> {
  const idempotencyKey = `pinflow:${provider}:${input.pinDraftId}:${input.pinAssetId}:${input.boardId}`;

  // ── Idempotency check ──────────────────────────────────────────
  const existing = await prisma.publishJob.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    if (existing.status === PublishJobStatus.PUBLISHED) {
      return { success: true, publishJobId: existing.id, alreadyPublished: true };
    }
    if (
      existing.status === PublishJobStatus.QUEUED ||
      existing.status === PublishJobStatus.SENDING
    ) {
      return { success: false, publishJobId: existing.id, alreadyQueued: true, error: "This pin is already queued for publishing." };
    }
  }

  // ── Rate limit checks ──────────────────────────────────────────
  const dailyLimit = await checkProjectDailyLimit(input.projectId);
  if (!dailyLimit.allowed) {
    return { success: false, error: dailyLimit.error };
  }

  const hourlyLimit = await checkAccountHourlyLimit(input.userId);
  if (!hourlyLimit.allowed) {
    return { success: false, error: hourlyLimit.error };
  }

  // ── Validate Pinterest account, scope, board, token ────────────
  const validation = await validatePinterestAccess(input.userId, input.boardId, provider);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  // ── Create queued job ──────────────────────────────────────────
  const now = new Date();
  const queuedJob = existing
    ? await prisma.publishJob.update({
        where: { id: existing.id },
        data: {
          status: PublishJobStatus.QUEUED,
          provider,
          boardId: input.boardId,
          boardName: input.boardName,
          requestPayload: null as any,
          responsePayload: null as any,
          externalPinId: null,
          externalUrl: null,
          errorMessage: null,
          attemptCount: 0,
          lockedAt: null,
          lockedBy: null,
          retryAfter: null,
          publishedAt: null,
          scheduledAt: input.scheduledAt ?? null,
          queuedAt: now,
        },
      })
    : await prisma.publishJob.create({
        data: {
          userId: input.userId,
          projectId: input.projectId,
          pinDraftId: input.pinDraftId,
          pinAssetId: input.pinAssetId,
          provider,
          status: PublishJobStatus.QUEUED,
          boardId: input.boardId,
          boardName: input.boardName,
          idempotencyKey,
          scheduledAt: input.scheduledAt ?? null,
          queuedAt: now,
        },
      });

  logger.info("Publish job queued", {
    publishJobId: queuedJob.id,
    provider,
    pinDraftId: input.pinDraftId,
    scheduledAt: input.scheduledAt ?? "now",
  });

  return { success: true, publishJobId: queuedJob.id };
}

// ─── Backend: process the queue ─────────────────────────────────────

/**
 * Process the publish queue. Claims up to `batchSize` jobs and publishes them.
 */
export async function processQueue(
  batchSize: number = 1,
  lockedBy: string = "queue-processor",
): Promise<ProcessQueueResult> {
  const now = new Date();
  const lockTimeout = new Date(now.getTime() - LOCK_TIMEOUT_MS);

  // Find processable jobs
  const candidates = await prisma.publishJob.findMany({
    where: {
      status: PublishJobStatus.QUEUED,
      AND: [
        {
          OR: [
            { scheduledAt: null },
            { scheduledAt: { lte: now } },
          ],
        },
        {
          OR: [
            { retryAfter: null },
            { retryAfter: { lte: now } },
          ],
        },
        {
          OR: [
            { lockedAt: null },
            { lockedAt: { lt: lockTimeout } },
          ],
        },
      ],
    },
    orderBy: [
      { scheduledAt: "asc" },
      { queuedAt: "asc" },
    ],
    take: batchSize,
  });

  if (candidates.length === 0) {
    return { processed: 0, results: [] };
  }

  const results: ProcessQueueResult["results"] = [];

  for (const candidate of candidates) {
    const result = await processSingleJob(candidate.id, lockedBy);
    results.push(result);
  }

  return { processed: results.length, results };
}

// ─── Single job processing ──────────────────────────────────────────

async function processSingleJob(
  jobId: string,
  lockedBy: string,
): Promise<{ publishJobId: string; status: string; error?: string }> {
  // ── Claim the job atomically ─────────────────────────────────
  const claimResult = await prisma.publishJob.updateMany({
    where: {
      id: jobId,
      status: PublishJobStatus.QUEUED,
    },
    data: {
      status: PublishJobStatus.SENDING,
      lockedAt: new Date(),
      lockedBy,
    },
  });

  if (claimResult.count === 0) {
    // Another processor claimed it first
    return { publishJobId: jobId, status: "ALREADY_CLAIMED" };
  }

  // Read claimed job with relations
  const job = await prisma.publishJob.findUnique({
    where: { id: jobId },
    include: { user: true },
  });

  if (!job) {
    return { publishJobId: jobId, status: "FAILED", error: "Job not found after claim" };
  }

  try {
    // ── Validate Pinterest access ───────────────────────────────
    const account = await prisma.pinterestAccount.findUnique({
      where: { userId: job.userId },
    });

    if (!account || account.status !== "CONNECTED") {
      return await failJob(job, "Pinterest account is not connected.");
    }

    const scopes = (account.scopes || "").split(/[,\s]+/).map((s) => s.trim());
    if (!scopes.includes("pins:write")) {
      return await failJob(job, "Pinterest publishing permission is missing. Please reconnect your account.");
    }

    const board = await prisma.pinterestBoard.findFirst({
      where: {
        userId: job.userId,
        pinterestAccountId: account.id,
        pinterestBoardId: job.boardId,
      },
    });
    if (!board) {
      return await failJob(job, "Selected board was not found in your synced Pinterest boards.");
    }

    const accessToken = await ensureValidAccessToken(account).catch(() => null);
    if (!accessToken) {
      return await failJob(job, "Pinterest token is invalid or expired. Please reconnect your account.");
    }

    // ── Build payload and publish ───────────────────────────────
    let requestPayload: PublishPayload;
    try {
      requestPayload = JSON.parse(job.requestPayload as string ?? "{}") as PublishPayload;
    } catch {
      // Reconstruct if stored payload is corrupted
      requestPayload = {
        publishJobId: job.id,
        projectId: job.projectId,
        pinDraftId: job.pinDraftId,
        pinAssetId: job.pinAssetId,
        title: "", // Will be overwritten below
        description: "",
        imageUrl: "",
        targetUrl: null,
        boardId: job.boardId,
        boardName: job.boardName,
        idempotencyKey: job.idempotencyKey,
        accessToken,
      };
    }

    // Ensure latest fields and token
    requestPayload.accessToken = accessToken;
    requestPayload.publishJobId = job.id;

    // Store request payload
    await prisma.publishJob.update({
      where: { id: job.id },
      data: {
        requestPayload: requestPayload as any,
      },
    });

    // ── Call provider ───────────────────────────────────────────
    const prov = getProvider(job.provider as PublishProvider);
    const publishResult = await prov.publish(requestPayload);

    if (publishResult.success) {
      // ── Success ───────────────────────────────────────────────
      await prisma.publishJob.update({
        where: { id: job.id },
        data: {
          status: PublishJobStatus.PUBLISHED,
          publishedAt: new Date(),
          lockedAt: null,
          lockedBy: null,
          externalPinId: publishResult.externalPinId ?? null,
          externalUrl: publishResult.externalUrl ?? null,
        },
      });

      logger.info("Publish queue job completed successfully", {
        publishJobId: job.id,
        pinDraftId: job.pinDraftId,
      });

      return { publishJobId: job.id, status: "PUBLISHED" };
    }

    // ── Failure ─────────────────────────────────────────────────
    return await failJob(job, publishResult.error ?? "Publish request failed");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Publish queue job exception", {
      publishJobId: job.id,
      error: message,
    });
    return await failJob(job, message);
  }
}

// ── Retry / fail logic ──────────────────────────────────────────────

async function failJob(
  job: { id: string; attemptCount: number; maxAttempts: number },
  errorMessage: string,
): Promise<{ publishJobId: string; status: string; error?: string }> {
  const newAttemptCount = job.attemptCount + 1;
  const isRateLimit = errorMessage.toLowerCase().includes("rate limit");
  const maxAttempts = job.maxAttempts || systemLimits.MAX_RETRY_ATTEMPTS;

  if (newAttemptCount < maxAttempts) {
    // Retry with backoff
    const backoffMinutes = systemLimits.MAX_RETRY_BACKOFF_MINUTES * newAttemptCount;
    const retryAfter = isRateLimit
      ? new Date(Date.now() + 60 * 60 * 1000) // 1h for rate limit
      : new Date(Date.now() + backoffMinutes * 60 * 1000);

    await prisma.publishJob.update({
      where: { id: job.id },
      data: {
        status: PublishJobStatus.QUEUED,
        attemptCount: newAttemptCount,
        errorMessage,
        retryAfter,
        lockedAt: null,
        lockedBy: null,
      },
    });

    logger.info("Publish job queued for retry", {
      publishJobId: job.id,
      attemptCount: newAttemptCount,
      maxAttempts,
      retryAfter,
    });

    return {
      publishJobId: job.id,
      status: "QUEUED_RETRY",
      error: errorMessage,
    };
  }

  // Max attempts exceeded — permanent failure
  await prisma.publishJob.update({
    where: { id: job.id },
    data: {
      status: PublishJobStatus.FAILED,
      attemptCount: newAttemptCount,
      errorMessage,
      lockedAt: null,
      lockedBy: null,
    },
  });

  logger.warn("Publish job failed permanently", {
    publishJobId: job.id,
    attemptCount: newAttemptCount,
    maxAttempts,
  });

  return {
    publishJobId: job.id,
    status: "FAILED",
    error: errorMessage,
  };
}

// ── Shared validation helper ────────────────────────────────────────

async function validatePinterestAccess(
  userId: string,
  boardId: string,
  provider: PublishProvider,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (provider !== PublishProvider.DIRECT_PINTEREST) {
    return { ok: true }; // Non-Pinterest providers skip Pinterest validation
  }

  const account = await prisma.pinterestAccount.findUnique({
    where: { userId },
  });

  if (!account || account.status !== "CONNECTED") {
    return { ok: false, error: "Pinterest account is not connected." };
  }

  const scopes = (account.scopes || "").split(/[,\s]+/).map((s) => s.trim());
  if (!scopes.includes("pins:write")) {
    return {
      ok: false,
      error: "Pinterest publishing permission is missing. Please reconnect your Pinterest account with the required permissions.",
    };
  }

  const board = await prisma.pinterestBoard.findFirst({
    where: {
      userId,
      pinterestAccountId: account.id,
      pinterestBoardId: boardId,
    },
  });

  if (!board) {
    return {
      ok: false,
      error: "Selected board was not found in your synced Pinterest boards. Please sync your boards and try again.",
    };
  }

  return { ok: true };
}
