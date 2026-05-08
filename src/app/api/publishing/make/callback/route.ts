import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { PublishJobStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

const makeCallbackSchema = {
  publishJobId: "string",
  status: "published | failed",
  externalPinId: "string?",
  externalUrl: "string?",
  error: "string?",
  publishedAt: "string?",
};

export async function POST(req: NextRequest) {
  // Authenticate via bearer token
  const authHeader = req.headers.get("authorization");
  const secret = env.MAKE_CALLBACK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "MAKE_CALLBACK_SECRET is not configured on the server." },
      { status: 500 },
    );
  }

  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== secret) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid MAKE_CALLBACK_SECRET." },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { publishJobId, status, externalPinId, externalUrl, error, publishedAt } = body;

    if (!publishJobId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: publishJobId, status" },
        { status: 400 },
      );
    }

    const job = await prisma.publishJob.findUnique({
      where: { id: publishJobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "PublishJob not found" },
        { status: 404 },
      );
    }

    if (status === "published") {
      await prisma.publishJob.update({
        where: { id: publishJobId },
        data: {
          status: PublishJobStatus.PUBLISHED,
          externalPinId: externalPinId ?? null,
          externalUrl: externalUrl ?? null,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
          lockedAt: null,
          lockedBy: null,
        },
      });

      logger.info("Make callback: job published", { publishJobId, externalPinId });
    } else {
      // failed — re-queue for retry or mark as failed
      const newAttemptCount = (job.attemptCount || 0) + 1;
      const maxAttempts = job.maxAttempts || 3;

      if (newAttemptCount < maxAttempts) {
        const retryAfter = new Date(Date.now() + newAttemptCount * 5 * 60 * 1000);
        await prisma.publishJob.update({
          where: { id: publishJobId },
          data: {
            status: PublishJobStatus.QUEUED,
            attemptCount: newAttemptCount,
            errorMessage: error ?? "Unknown error",
            retryAfter,
            lockedAt: null,
            lockedBy: null,
          },
        });
        logger.info("Make callback: job queued for retry", { publishJobId, attemptCount: newAttemptCount });
      } else {
        await prisma.publishJob.update({
          where: { id: publishJobId },
          data: {
            status: PublishJobStatus.FAILED,
            attemptCount: newAttemptCount,
            errorMessage: error ?? "Max attempts exceeded",
            lockedAt: null,
            lockedBy: null,
          },
        });
        logger.warn("Make callback: job failed permanently", { publishJobId });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Make callback processing failed", { error: message });
    return NextResponse.json(
      { error: "Callback processing failed" },
      { status: 500 },
    );
  }
}
