import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { processQueue } from "@/features/publishing/services/publishing-queue.service";
import { logger } from "@/lib/logger";

type ProcessStatus = "NO_JOBS" | "SUCCESS" | "PARTIAL" | "FAILED" | "ERROR";

interface ProcessResponse {
  ok: boolean;
  status: ProcessStatus;
  processedCount: number;
  totalCount: number;
  results: Array<{
    publishJobId: string;
    status: string;
    error?: string;
  }>;
  message?: string;
}

export async function POST(req: NextRequest) {
  // ── Authenticate via bearer token ──────────────────────────────
  const authHeader = req.headers.get("authorization");
  const secret = env.PUBLISH_QUEUE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { ok: false, status: "ERROR", processedCount: 0, totalCount: 0, results: [], message: "PUBLISH_QUEUE_SECRET is not configured on the server." } satisfies ProcessResponse,
      { status: 500 },
    );
  }

  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== secret) {
    return NextResponse.json(
      { ok: false, status: "ERROR", processedCount: 0, totalCount: 0, results: [], message: "Unauthorized. Provide a valid PUBLISH_QUEUE_SECRET." } satisfies ProcessResponse,
      { status: 401 },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(
      Math.max(body.batchSize ?? env.PUBLISH_QUEUE_BATCH_SIZE, 1),
      env.PUBLISH_QUEUE_MAX_BATCH_SIZE,
    );

    logger.info("Publish queue processing triggered", { batchSize });

    const result = await processQueue(batchSize);

    let status: ProcessStatus;
    if (result.processed === 0) {
      status = "NO_JOBS";
    } else {
      const hasFailures = result.results.some((r) => r.status === "FAILED" || r.status === "QUEUED_RETRY");
      const hasSuccess = result.results.some((r) => r.status === "PUBLISHED");
      if (hasSuccess && hasFailures) {
        status = "PARTIAL";
      } else if (hasSuccess) {
        status = "SUCCESS";
      } else {
        status = "FAILED";
      }
    }

    const response: ProcessResponse = {
      ok: true,
      status,
      processedCount: result.processed,
      totalCount: result.results.length,
      results: result.results,
    };

    logger.info("Publish queue processing complete", {
      status,
      processedCount: result.processed,
      totalCount: result.results.length,
    });

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Publish queue processing failed", { error: message });

    return NextResponse.json(
      { ok: false, status: "ERROR", processedCount: 0, totalCount: 0, results: [], message } satisfies ProcessResponse,
      { status: 500 },
    );
  }
}
