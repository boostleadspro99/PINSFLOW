# CURRENT_TASK.md — Phase 9E.1 Cron Processor + Queue Operationalization

## Task

Make the existing Publish Queue operational for automatic processing through a secured cron endpoint. The queue must support QUEUED → PUBLISHED / RETRY / FAILED automatically when triggered.

## Context

PinFlow OS has a fully functional Publish Queue (Phase 9D) with idempotency, rate limits, retry/backoff, and atomic job locking. The `/api/publishing/queue/process` endpoint exists and is secured with Bearer token auth.

However, the queue depends on an external cron that has not been set up. This phase operationalizes the queue so it can be triggered securely and predictably.

## Scope

### Allowed

- Improve `/api/publishing/queue/process` response format
- Add `PUBLISH_QUEUE_BATCH_SIZE`, `PUBLISH_QUEUE_MAX_BATCH_SIZE`, `PUBLISH_QUEUE_LOCK_TIMEOUT_MINUTES` env vars
- Add queue status widget (QUEUED count + manual "Process Now" button) to pins page
- Add server action to manually trigger queue processing
- Update documentation for external cron setup
- Add PublishQueueRun model for operational logs (optional)

### Forbidden

- Full autopilot (auto-generating content, auto-generating images)
- Analytics
- Billing
- Reintroducing Make
- Modifying Pinterest OAuth, AI prompts, Cloudflare image provider, R2 storage
- Implementing scheduled auto-generation

## Requirements

1. Unauthorized processor call returns 401
2. Authorized processor call with no jobs returns NO_JOBS
3. Authorized processor call with QUEUED jobs processes them
4. Batch size is configurable via env (default 1, max 5)
5. Response includes clean JSON summaries: SUCCESS, PARTIAL, FAILED, NO_JOBS
6. Atomic claim/locking is preserved
7. Retry/backoff is preserved
8. Rate limits are preserved
9. Token refresh is preserved

## Acceptance Criteria

- Unauthorized → 401
- No jobs → `{ ok: true, status: "NO_JOBS", processedCount: 0 }`
- All jobs processed → `{ ok: true, status: "SUCCESS", processedCount: N }`
- Some failed → `{ ok: true, status: "PARTIAL", processedCount: N }`
- All failed → `{ ok: true, status: "FAILED", processedCount: N }`
- Build passes
- No forbidden modules implemented
