# DECISIONS.md

## Purpose

This file records important project decisions and the reasoning behind them.

It prevents future AI sessions from reversing decisions without understanding the context.

---

## How to Use This File

Before changing architecture, stack, database, auth, deployment, security rules, routing strategy, or major UI/UX direction, read this file.

When an important decision is made, add a new entry using the decision template below.

Do not record small implementation details here.
Only record decisions that affect future development direction.

---

## Decision Template

```md
## YYYY-MM-DD — Decision Title

### Decision

What was decided?

### Context

Why was this decision needed?

### Options Considered

1. Option A
2. Option B
3. Option C

### Reasoning

Why was this option selected?

### Consequences

What does this decision imply for future development?

### Revisit Conditions

When should this decision be reconsidered?
```

---

## Decisions

## 2026-05-04 — Use CURRENT_TASK.md as Active Phase Guardrail

### Decision

The project will use `CURRENT_TASK.md` as the active short-term execution guardrail for the current development phase.

### Context

The project is developed with AI-assisted coding. The PRD contains the full product vision, but implementing too much too early can cause scope creep, architecture drift, unnecessary dependencies, and premature work on auth, Pinterest, AI, or database features.

### Options Considered

1. Use only `PRD.md` for all implementation guidance.
2. Use prompts only to define the current task.
3. Use a dedicated `CURRENT_TASK.md` file as the active phase guardrail.

### Reasoning

A dedicated current task file keeps the AI focused on the current phase. It prevents Gemini from starting future features too early and makes each session safer, smaller, and easier to verify.

### Consequences

Future AI coding sessions must read `CURRENT_TASK.md` before coding and must not implement anything outside the active phase scope.

### Revisit Conditions

Revisit this decision only if the project adopts another formal task management system or if `CURRENT_TASK.md` becomes redundant.

## 2026-05-04 — Use ARCHITECTURE_RULES.md as Technical Implementation Contract

### Decision

The project will use `ARCHITECTURE_RULES.md` as the official technical architecture and implementation rules document.

### Context

The project uses AI-assisted development. A dedicated architecture rules file is needed to prevent inconsistent folder structures, routing patterns, component organization, server/client boundary mistakes, unsafe data access, and unplanned technical changes.

### Options Considered

1. Keep architecture rules only inside `PROJECT_AGENT.md`
2. Keep architecture rules only inside `PRD.md`
3. Use a dedicated `ARCHITECTURE_RULES.md` file

### Reasoning

A dedicated architecture file keeps technical rules short, operational, and easy for future AI sessions to follow. It avoids turning `PROJECT_AGENT.md` into a long architecture document and avoids mixing implementation rules with product requirements in `PRD.md`.

### Consequences

Future code changes must respect `ARCHITECTURE_RULES.md`. Any architecture, routing, database, auth, security, or folder-structure change must be checked against this file first.

### Revisit Conditions

Revisit this decision only if the project structure changes significantly or if the architecture rules become obsolete.

## 2026-05-04 — Core Stack & Database

### Decision
Use Next.js (App Router), Prisma, MySQL, NextAuth, and Tailwind CSS + shadcn/ui.

### Context
Required per to the initial PRD specification outlining the MVP stack requirement for PinFlow OS.

### Options Considered
- Express + React + PostgreSQL
- Next.js + MongoDB
- Next.js + Prisma + MySQL (Selected)

### Reasoning
Next.js provides server actions and API routes conducive to building the structured `src/server/` API handlers efficiently. Prisma offers type-safe schemas which aligns with the TypeScript clean architecture requirement. MySQL enables an easy deployment to Hostinger.

### Consequences
All domain logic connects via Prisma client, and front-end leverages Server Components or explicitly defined client components with shadcn/ui.

### Revisit Conditions
If hosting limits Node.js processes, a separate standalone backend worker system may be needed for scheduling features in the future.

## 2026-05-05 — Mock Image Generation Provider First

### Decision

Use a mock image generation provider (picsum.photos placeholder URLs) for MVP instead of a real AI image generation provider.

### Context

Phase 7 requires image assets linked to PinDrafts. The current AI abstraction only supports text generation via Gemini. No real image generation provider (Imagen, DALL-E, Replicate) is configured or has available API keys.

### Options Considered

1. Require a real image generation provider before starting Phase 7.
2. Implement a mock provider returning placeholder images (Selected).
3. Skip image generation entirely and only support external URL attachment.

### Reasoning

A mock provider allows the image asset layer to be built, tested, and iterated on without blocking on provider API keys or billing setup. External URL attachment is also available as a fallback, giving users a real workflow even without any image generation provider.

### Consequences

Image generation produces placeholder images until a real provider is configured. The provider abstraction makes swapping in a real provider straightforward without changing the PinAsset service or UI.

### Revisit Conditions

Revisit when a real image generation provider (Gemini Imagen, OpenAI DALL-E, Replicate) is configured and has available API keys.

## 2026-05-05 — One-to-One PinAsset Relation (PinDraft → PinAsset)

### Decision

Use a one-to-one relation between PinDraft and PinAsset, enforced by `@unique` on `pinDraftId` in the Prisma schema.

### Context

PinDraft needs an image asset before publishing. Multiple images per draft could be useful (A/B testing, variants) but adds complexity to the MVP.

### Options Considered

1. One-to-many: PinDraft has many PinAssets (future).
2. One-to-one: PinDraft has zero or one PinAsset (Selected).
3. No PinAsset model: Store image URL directly in PinDraft.

### Reasoning

The one-to-one relation keeps the MVP simple: one draft = one image. It avoids complex selection logic, default asset queries, and UI for multiple images. If the user regenerates the image, the existing asset is upserted (replaced). If the asset is archived, a new one can be created.

### Consequences

Supporting multiple images per draft later requires removing the `@unique` constraint on `pinDraftId`, updating the PinDraft query to include multiple assets, and adding a default/active asset selector in the UI.

### Revisit Conditions

Revisit when the product requires A/B testing, multi-variant images, or a campaign system with multiple images per pin.

## 2026-05-05 — Credentials Provider + bcryptjs for Email/Password Auth

### Decision

Add email/password authentication alongside Google OAuth using NextAuth.js Credentials provider, with passwords hashed via bcryptjs.

### Context

Phase 7.1 requires reliable Google sign-in AND email/password authentication. The Google sign-in button was not working due to missing environment variables. Adding credential authentication provides a fallback when Google OAuth is unavailable and enables local development without configuring Google OAuth credentials.

### Options Considered

1. **bcryptjs** (Selected) — Zero-install (already in package.json), pure JavaScript, no native compilation needed, async hash/compare API, well-tested.
2. **argon2** — More modern algorithm but requires native compilation (node-gyp), not already in dependencies.
3. **bcrypt** (native) — Requires node-gyp, not already in dependencies.

### Reasoning

bcryptjs is already listed in `package.json` as a dependency (`"bcryptjs": "^3.0.3"`). Adding it avoids introducing a new dependency with native compilation requirements. It provides sufficient security for this application's authentication needs with a salt cost factor of 12.

### Consequences

- Password-based users have `passwordHash` set on the User model; OAuth-only users have `passwordHash = null`.
- Passwords are never returned to the client.
- Passwords are never logged.
- The `authorize` callback uses a generic "Invalid email or password" error to avoid leaking whether an email exists.
- Future rate limiting and password reset are noted as TODOs but not implemented.

### Revisit Conditions

Revisit if the application requires higher password security guarantees (e.g., enterprise compliance) or if bcryptjs is unmaintained. In that case, migrate to argon2.

## 2026-05-05 — One PinterestAccount Per User (MVP)

### Decision

Use one PinterestAccount per User, enforced by `@unique` on `userId`.

### Context

Phase 8 requires storing Pinterest OAuth connections. Multi-account Pinterest management is a future need.

### Options Considered

1. **One-to-one** (Selected): Each User has at most one PinterestAccount.
2. **One-to-many**: Each User can have multiple PinterestAccounts.
3. **Separate Pinterest user management**: Full account-switching UI and logic.

### Reasoning

One account per user keeps the MVP simple: no account selection UI, no default account logic, no complex queries. The unique constraint on `userId` enforces this at the database level.

### Consequences

- Only one Pinterest account can be connected per user.
- Reconnecting replaces the existing connection.
- Supporting multiple accounts later requires removing the `@unique` constraint, updating queries, and adding account selection UI.

### Revisit Conditions

Revisit when users request multi-account Pinterest management (managing multiple Pinterest business accounts from one PinFlow account).

## 2026-05-05 — AES-256-GCM Pinterest Token Encryption

### Decision

Encrypt Pinterest tokens using Node.js `crypto` with AES-256-GCM, keyed by `PINTEREST_TOKEN_ENCRYPTION_KEY`.

### Context

Phase 8 requires storing Pinterest OAuth access and refresh tokens server-side. The PRD mandates token encryption.

### Options Considered

1. **AES-256-GCM** (Selected): Authenticated encryption, built into Node.js crypto, no dependencies.
2. **AES-256-CBC**: Available but lacks built-in authentication (needs separate HMAC).
3. **No encryption**: Store raw tokens (rejected per PRD requirement).
4. **Third-party library**: Additional dependency for standard encryption.

### Reasoning

AES-256-GCM provides confidentiality and authenticity in a single operation. It is available in Node.js `crypto` without additional dependencies. The key is derived from `PINTEREST_TOKEN_ENCRYPTION_KEY` via SHA-256 to ensure exactly 32 bytes regardless of the input length.

### Consequences

- Tokens are stored as `iv:authTag:ciphertext` (hex-encoded) in the database.
- Token encryption/decryption requires the `PINTEREST_TOKEN_ENCRYPTION_KEY` env var.
- If the key is lost, existing tokens cannot be decrypted and accounts must be reconnected.
- Token storage is server-only; encrypted tokens are never sent to the client.

### Revisit Conditions

Revisit if a more robust key management system (e.g., AWS KMS, Vault) is needed for production.

## 2026-05-05 — OAuth State Cookie Strategy

### Decision

Store OAuth state as an httpOnly cookie with a 10-minute expiry, validated on the callback route.

### Context

Phase 8 requires OAuth state validation to prevent CSRF attacks during Pinterest OAuth.

### Options Considered

1. **httpOnly cookie** (Selected): Random 32-byte hex state stored in cookie, deleted after validation.
2. **Database-backed state**: Store state in a table with expiry — more durable but adds DB queries and cleanup.
3. **JWT-encoded state**: Self-contained but adds complexity for simple state validation.

### Reasoning

Cookie-based state is simpler than database-backed state for MVP. The httpOnly flag prevents JavaScript access. The 10-minute expiry is sufficient for OAuth flows. Cookie is deleted after successful validation.

### Consequences

- State is inaccessible to client-side JavaScript.
- State expires after 10 minutes.
- Pinterest redirects must arrive within 10 minutes of starting OAuth.
- For production with multiple server instances, cookie-based state requires sticky sessions or a shared session store.

### Revisit Conditions

Revisit if the app is deployed across multiple load-balanced instances without sticky sessions, requiring database-backed state instead.

## 2026-05-05 — Minimal OAuth Scopes for Phase 8

### Decision

Request only `boards:read` and `user_accounts:read` OAuth scopes for Phase 8.

### Context

Phase 8 only needs to connect Pinterest and sync boards. Publishing scopes are not yet needed.

### Options Considered

1. **Minimal scopes** (Selected): `boards:read`, `user_accounts:read`.
2. **Full scopes upfront**: Include `pins:read`, `pins:write`, `boards:write` now to avoid re-authorization later.
3. **No OAuth scopes in Phase 8**: Not possible — boards sync requires authorization.

### Reasoning

Minimal scopes follow the principle of least privilege. Requesting publish scopes before publishing is implemented could confuse users during Pinterest authorization. The user can re-authorize with additional scopes when Pin publishing is implemented in Phase 9.

### Consequences

- Publishing phases will require re-authorization with additional scopes (`pins:read`, `pins:write`).
- Users will see a Pinterest authorization screen with limited permissions during Phase 8.
- Scope upgrades in Phase 9 may cause user friction (re-auth prompt on Pinterest).

### Revisit Conditions

Revisit when Phase 9 (Manual Pin Publishing) starts. At that point, add `pins:read` and `pins:write` to the requested scopes.

## 2026-05-06 — Make Webhook Provider as MVP Publishing Provider

### Decision

Use Make.com as an external webhook publishing provider for Phase 9 instead of calling the Pinterest API directly from PinFlow OS.

### Context

Pinterest Developer Trial Access was denied, making direct Pinterest API publishing impossible. Make.com can act as an intermediary: PinFlow OS sends a signed webhook payload to Make, Make publishes to the Pinterest API, and Make calls back PinFlow OS with the result.

### Options Considered

1. **Make webhook provider** (Selected): PinFlow OS sends payload to Make, Make publishes to Pinterest, Make calls back.
2. **Direct Pinterest API**: Blocked — Pinterest Developer Trial Access denied.
3. **n8n / self-hosted alternative**: More control but adds hosting complexity for MVP.
4. **Zapier**: Similar to Make but less flexible for callback pattern.

### Reasoning

Make.com is a no-code automation platform that can authenticate with Pinterest OAuth and make Pinterest API calls. PinFlow OS remains the source of truth — it creates and tracks PublishJobs, stores payloads, and processes callbacks. Make only executes the API call. This unblocks publishing without requiring Pinterest API approval for PinFlow OS itself.

### Consequences

- Publishing depends on Make.com webhook availability and configuration.
- PinFlow OS needs 3 new env vars: `MAKE_WEBHOOK_URL`, `MAKE_WEBHOOK_SECRET`, `MAKE_CALLBACK_SECRET`.
- The publishing provider abstraction (`src/server/publishing/`) allows switching to direct Pinterest API later when access is granted.
- PublishJob model tracks full lifecycle (PENDING → SENDING → PUBLISHED/FAILED).
- Callback security uses Bearer token (MAKE_CALLBACK_SECRET) to authenticate Make → PinFlow OS requests.

### Revisit Conditions

Revisit when Pinterest Developer Access is granted or if Make.com becomes unreliable. At that point, implement a `DirectPinterestProvider` using the same PublishingProvider interface.

## 2026-05-06 — AI Model Registry + Project-Level Settings

### Decision

Add a typed AI model registry (`src/config/ai-models.ts`) and project-level AI settings (`ProjectAISettings` model) so each project can choose which model is used for Content Ideas, Pin Drafts, and Image Prompt generation.

### Context

PinFlow OS currently hardcodes Gemini for all AI generation. As the app moves toward autopilot, the user needs control over which model powers each task. Different tasks benefit from different models, and different projects have different quality/cost requirements.

### Options Considered

1. **Global config only** (simpler): One setting applied to all projects and all tasks — not flexible enough.
2. **Project-level per-task settings** (Selected): Each project can choose models for Content Ideas, Pin Drafts, Image Prompt independently.
3. **No config** (current): Hardcoded Gemini — works but blocks provider diversification.

### Reasoning

Project-level settings give the user control without overcomplicating the MVP. The registry pattern (`getModelsByCapability`, `getModelByKey`, `getDefaultModelForTask`) makes it safe to add new providers later. Providers not yet implemented are declared as `DISABLED` in the registry. The `resolveModelForTask` helper checks project settings → fallback → registry default, so existing flows never break even if no settings are configured.

### Consequences

- Content Ideas and Pin Draft flows now resolve the model before generating.
- If no ProjectAISettings exist, the registry default (Gemini 2.0 Flash) is used transparently.
- New providers can be added by declaring them in `ai-models.ts` and implementing the provider.
- The `/dashboard/settings/ai` page allows per-project model selection.
- `AIModelConfig` table is ready but not seeded via migration — models come from the registry config file.

### Revisit Conditions

Revisit when a second AI provider (OpenRouter, DeepSeek) is actually implemented and available in production. At that point, seed the `AIModelConfig` table or provide a UI to manage capability-to-model mapping.

## 2026-05-06 — Remove Make Provider & Standardize Direct Pinterest Publishing

### Decision

Remove Make.com as a publishing provider. Direct Pinterest via the official API v5 is the only active publishing path.

### Context

Pinterest OAuth, boards sync, and Direct Pinterest publishing are fully operational. The original product vision was always to publish directly through the official Pinterest API. Make.com was introduced as a temporary bridge when Pinterest Developer Trial Access was denied. That constraint no longer applies.

### Options Considered

1. **Remove Make entirely** (Selected): Unregister MakeWebhookProvider, delete callback route, simplify UI to Direct Pinterest only.
2. **Keep both providers**: Users can choose Make or Direct Pinterest — unnecessary complexity now that Direct Pinterest works.
3. **Keep Make as fallback**: If Direct Pinterest fails, fall back to Make — premature optimization, adds complexity without evidence of need.

### Reasoning

The Pinterest app is active. Direct Pinterest API publishing works. Make.com is an unnecessary dependency, adds 3 environment variables, a callback endpoint, and UI complexity. Removing it simplifies the architecture, reduces deployment configuration, and aligns with the PRD requirement to use official APIs.

### Consequences

- `MakeWebhookProvider` unregistered from provider registry but source file preserved.
- Make callback API route (`/api/publishing/make/callback`) deleted.
- `processMakeCallback` and `makeCallbackSchema` removed.
- Provider selection UI removed — Direct Pinterest is the only option.
- `MAKE_WEBHOOK_URL`, `MAKE_WEBHOOK_SECRET`, `MAKE_CALLBACK_SECRET` removed from env.
- `PublishProvider.MAKE` enum preserved in Prisma for existing PublishJob history rows.
- New PublishJobs always use `DIRECT_PINTEREST`.

### Revisit Conditions

Revisit only if Pinterest API access is lost and an intermediary provider is needed again. In that case, the provider abstraction still supports adding new providers without refactoring the publishing service.

## 2026-05-07 — Database Migration Strategy: db push for Dev/MVP, Migrations for Production

### Decision

Use `prisma db push` during development and MVP phase on Hostinger. Before production launch, switch to versioned migrations (`prisma migrate dev` + `prisma migrate deploy`).

### Context

Hostinger (the current hosting provider) does not support `CREATE DATABASE` privileges, which is required by Prisma's shadow database for `migrate dev`. The shadow database is a temporary database Prisma creates to detect schema drift during migration generation. Without it, `migrate dev` fails.

`prisma db push` works because it synchronizes the schema directly without needing a shadow database.

### Options Considered

1. **db push for all phases** (not selected): Loses schema history, no versioned rollbacks, risky for production.
2. **db push for dev/MVP, migrate for production** (Selected): Pragmatic split — speed now, safety later.
3. **Self-hosted shadow database** (rejected): Adds a secondary database purely for Prisma migrations, increases hosting cost and complexity for MVP.
4. **Manual migration files** (rejected): Writing SQL migrations by hand defeats the purpose of using Prisma.

### Reasoning

- `db push` is acceptable for rapid prototyping: it's fast, requires no shadow DB, and schema changes are immediately reflected.
- Before production, the schema will be stable enough that running `migrate dev` locally (where the developer has full DB privileges) to generate migration files, then deploying them via `migrate deploy`, is the correct workflow.
- Attempting to run a shadow database on Hostinger or a third provider adds cost and operational complexity before the product has proven demand.

### Consequences

- All schema changes during MVP are applied via `db push`. No migration history is tracked.
- Before production launch, someone must run `prisma migrate dev` from a local environment with full database privileges to generate the initial migration from the current schema.
- The migration files must be committed to the repository.
- After the initial migration, all future schema changes MUST use `prisma migrate dev` + `prisma migrate deploy` — `db push` becomes forbidden in production.
- The `PROJECT_STATE.md` open issue entry for "shadow database" will be updated to reference this decision.

### Revisit Conditions

Revisit this decision when:
1. Preparing for production launch — at that point, generate migrations from the current schema.
2. Hostinger adds `CREATE DATABASE` support, making shadow databases possible directly.
3. The project adds a CI/CD pipeline that can run `migrate deploy` automatically.
