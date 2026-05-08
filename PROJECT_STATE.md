# PROJECT_STATE.md

## Purpose

This file is the active memory of the project.

It must be updated after every meaningful development phase so future AI sessions can understand the current project state without losing context.

---

## Current Project Status

Status: In Progress

Last updated: 2026-05-08

Current phase:
Phase 9E.1 — Cron Processor + Queue Operationalization (complete)

---

## Product Summary

PinFlow OS is an AI-powered mini SaaS web application that helps users generate, organize, schedule, publish, and analyze Pinterest content, starting from keyword research to final pin publication.

---

## Current Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI library: shadcn/ui
- Database: MySQL (via Prisma)
- Auth: NextAuth.js (JWT strategy, Google OAuth provider, Credentials provider with bcryptjs)
- AI: Cloudflare Qwen3 (text), Cloudflare FLUX (image)
- Storage: Cloudflare R2
- Deployment: Firebase Studio / Hostinger

---

## Completed Features

- [x] Phase 0: Next.js foundation, folder structure, config
- [x] Phase 1: Prisma + MySQL + NextAuth foundation
- [x] Phase 2: Dashboard shell (sidebar, topbar, layout)
- [x] Phase 3: Projects / Niches CRUD
- [x] Phase 4: Keywords module (manual + CSV import)
- [x] Phase 4.1: Keywords enum alignment
- [x] Phase 5: AI Client abstraction + Content Ideas module
- [x] Phase 6: Pin Drafts textual foundation
- [x] Phase 7: Image Assets / Generation foundation
- [x] Phase 7.1: Auth Hardening (Google + Email/Password)
- [x] Phase 8: Pinterest OAuth + Boards Sync
- [x] Phase 8.1: Pinterest Token Auto-Refresh
- [x] Phase 9: Manual Publish via Make Webhook Provider (historical)
- [x] Phase 9A.1: AI Model Configuration & Provider Registry
- [x] Phase 9C: Remove Make Provider & Standardize Direct Pinterest
- [x] Phase 9C.1: Publishing Naming Cleanup
- [x] Phase 9D.0: Rate Limiting & Retry Fields
- [x] Phase 9D: Publish Queue
- [x] Phase 9D.2: Cloudflare AI Providers + Premium Model Registry
- [x] Phase 9D.3: Public Image Storage (R2)
- [x] Phase 9E.1: Cron Processor + Queue Operationalization

---

## Phase 9E.1 Detail — Cron Processor + Queue Operationalization

### Scope

Transform the publish queue from manual-only to cron-ready with clean response formats, env-configurable batch processing, and a dashboard status widget.

### Changes

1. **Hardened `/api/publishing/queue/process` endpoint** — Clean JSON response format:
   - `SUCCESS` — All jobs processed successfully
   - `PARTIAL` — Some succeeded, some failed
   - `FAILED` — All failed
   - `NO_JOBS` — No processable jobs found
   - `ERROR` — Server error or auth failure
   - Auth (Bearer token) required — returns 401 if missing/invalid
   - Batch size from body or env, capped at `PUBLISH_QUEUE_MAX_BATCH_SIZE`

2. **Added env vars:**
   - `PUBLISH_QUEUE_BATCH_SIZE` (default: 1)
   - `PUBLISH_QUEUE_MAX_BATCH_SIZE` (default: 5)
   - `PUBLISH_QUEUE_LOCK_TIMEOUT_MINUTES` (default: 5)

3. **Added `processQueueAction` server action** — Manual trigger with results summary. Returns `SUCCESS/PARTIAL/FAILED/NO_JOBS`.

4. **Added `getQueueStatsAction` server action** — Returns counts of QUEUED / SENDING / PUBLISHED / FAILED jobs.

5. **Added `QueueStatusCard` widget** on the pins page — Shows queue stats grid + "Process Now" button + cron setup instructions.

### Key Behaviors

- Unauthorized → 401
- No jobs → `{ ok: true, status: "NO_JOBS", processedCount: 0 }`
- All published → `{ ok: true, status: "SUCCESS" }`
- Mixed → `{ ok: true, status: "PARTIAL" }`
- All failed → `{ ok: true, status: "FAILED" }`
- Atomic claim/locking preserved
- Retry/backoff preserved
- Rate limits preserved
- Token refresh preserved

### Files Created
- `src/features/publishing/actions/process-queue.action.ts` — Server actions for manual trigger + stats
- `src/features/publishing/components/QueueStatusCard.tsx` — Queue status widget

### Files Modified
- `src/app/api/publishing/queue/process/route.ts` — Clean JSON response format
- `src/features/publishing/services/publishing-queue.service.ts` — Env-based lock timeout
- `src/lib/env.ts` — Added queue env vars
- `.env` — Added queue env vars with defaults
- `CURRENT_TASK.md` — Updated to Phase 9E.1
- `src/app/(dashboard)/dashboard/projects/[projectId]/pins/page.tsx` — Added queue status widget

### Verification
- Build: passed (38.4s, 0 errors)
- TypeScript: passed
- Lint: skipped (no lint script configured)

---

## Next Recommended Steps

- Phase 9E.2 — Queue Monitoring & Notifications
- Phase 9F — Full Autopilot
- Phase 10 — Analytics

---

## Open Bugs / Issues

| Issue | Status | Notes |
|---|---|---|
| MAX_BOARD_SYNC_ATTEMPTS_PER_HOUR | Open | Constante déclarée mais pas appliquée |
| Shadow database on Hostinger | Decision | db push toléré en MVP, migrations obligatoires avant prod |
| WebSocket HMR in Firebase Studio | Open | Faux positif — n'affecte pas le fonctionnement |

---

## Verification Status

- Build: passed
- TypeScript: passed
- Lint: not run (no script configured)
- Tests: not run (no test suite configured)
- Manual check: not run
