# ARCHITECTURE_RULES.md — PinFlow OS

## Purpose

This file defines the technical architecture and implementation rules for this project.

It must be followed when creating or modifying folders, routes, components, server/client boundaries, data access, validation, auth, security, styling architecture, and shared utilities.

It is not a PRD.
It is not a feature list.
It is not a progress tracker.

Use this file as the technical implementation contract.

## Current Phase Scope

Before applying architecture rules, read `CURRENT_TASK.md`.

`ARCHITECTURE_RULES.md` defines how code should be structured.

`CURRENT_TASK.md` defines what may be implemented right now.

Do not create architecture for future features unless the current task explicitly requires it.

---

> Operational architecture rules for AI-assisted development.  
> This file must be placed at the root of the project:

```txt
/ARCHITECTURE_RULES.md
```

This document is shorter and more operational than `PRD.md`.  
It exists to guide Google AI Studio, Gemini, or any AI coding assistant during implementation.

The AI must follow these rules before creating, editing, refactoring, or deleting code.

---

## 1. Project Identity

Project name:

```txt
PinFlow OS
```

Product type:

```txt
Mini SaaS web application for AI-assisted Pinterest content generation, scheduling, publishing, and analytics.
```

Core workflow:

```txt
Project → Keywords → AI Ideas → Pin Drafts → Image Assets → Approval → Publish → Analytics → Learning
```

This is **not** a browser automation bot.

---

## 2. Non-Negotiable Architecture Rules

The application must never use:

```txt
Playwright login automation
Puppeteer login automation
Pinterest password storage
Cookie reuse
Anti-detection logic
Proxy rotation to bypass limits
Private Pinterest page scraping
Unauthorized automation
```

The application must use:

```txt
Pinterest OAuth
Official Pinterest API
Server-side token storage
Server-side API calls
Rate limiting
Logs
User approval workflow
```

---

## 3. Core Stack

Use this stack unless the user explicitly changes it:

```txt
Next.js App Router
React
TypeScript strict
Tailwind CSS
shadcn/ui
Zod
Prisma
MySQL
Auth.js / NextAuth
Cloudinary or Cloudflare R2 for images
Gemini as first AI provider
Pinterest official API
Redis + BullMQ later for scheduling
```

Do not introduce new major dependencies without explaining why.

---

## 4. Repository Structure

The root structure must remain close to this:

```txt
pinflow-os/
├── PRD.md
├── ARCHITECTURE_RULES.md
├── CURRENT_TASK.md
├── README.md
├── .env.example
├── package.json
├── prisma/
├── public/
├── src/
│   ├── app/
│   ├── features/
│   ├── components/
│   ├── server/
│   ├── lib/
│   ├── config/
│   └── types/
└── worker/
```

The `worker/` folder is optional during MVP 1 and can be added later.

---

## 5. Next.js App Router Rules

Use the App Router structure:

```txt
src/app/
```

Route groups:

```txt
src/app/(marketing)/
src/app/(auth)/
src/app/(dashboard)/
src/app/api/
```

Rules:

```txt
Use Server Components by default.
Use Client Components only when interactivity is required.
Do not put business logic in page.tsx files.
Do not call Prisma directly from client components.
Do not expose server secrets to the browser.
Use route handlers for external callbacks and API endpoints.
```

---

## 6. Feature Module Pattern

Each business domain must live in `src/features/[feature-name]/`.

Standard structure:

```txt
src/features/[feature-name]/
├── components/
├── actions/
├── services/
├── schemas/
├── queries/
├── types/
└── utils/
```

Example:

```txt
src/features/projects/
├── components/
│   ├── ProjectForm.tsx
│   ├── ProjectTable.tsx
│   └── ProjectCard.tsx
├── actions/
│   ├── create-project.action.ts
│   ├── update-project.action.ts
│   └── archive-project.action.ts
├── services/
│   └── project.service.ts
├── schemas/
│   └── project.schema.ts
├── queries/
│   └── project.queries.ts
├── types/
│   └── project.types.ts
└── utils/
    └── project-slug.ts
```

---

## 7. Responsibility Boundaries

### 7.1 Components

Components may:

```txt
Render UI
Receive typed props
Use small local UI state
Trigger actions
Display loading, empty, error, and success states
```

Components must not:

```txt
Access Prisma directly
Contain business rules
Access secrets
Call Pinterest API directly
Call AI providers directly
Perform authorization logic
```

---

### 7.2 Server Actions

Server actions must:

```txt
Run on server
Validate input with Zod
Check authentication
Check ownership
Call service functions
Return typed success/error responses
```

Server actions must not:

```txt
Contain large business logic
Duplicate service logic
Return raw stack traces to the client
Expose secrets
```

---

### 7.3 Services

Services must:

```txt
Contain business logic
Handle database writes
Call external APIs
Apply domain rules
Use typed errors or predictable result objects
```

Examples:

```txt
project.service.ts
keyword.service.ts
pin-draft.service.ts
pinterest-publish.service.ts
ai-generation.service.ts
```

---

### 7.4 Queries

Queries must:

```txt
Read from database
Scope reads by authenticated user/project ownership
Avoid mutations
Return typed data
```

---

### 7.5 Schemas

Schemas must:

```txt
Use Zod
Validate forms
Validate route params
Validate server action inputs
Validate API request bodies
Validate AI structured outputs
```

---

## 8. Server Folder Rules

Use `src/server/` for cross-feature server logic.

Recommended structure:

```txt
src/server/
├── ai/
├── pinterest/
├── jobs/
├── services/
├── queries/
├── actions/
└── db/
```

External integrations must live here, not inside React components.

---

## 9. Pinterest Integration Rules

Pinterest code must be isolated in:

```txt
src/server/pinterest/
```

Recommended files:

```txt
src/server/pinterest/
├── pinterest-client.ts
├── pinterest-oauth.ts
├── pinterest-boards.ts
├── pinterest-pins.ts
├── pinterest-analytics.ts
└── pinterest.types.ts
```

Rules:

```txt
Never request Pinterest password.
Never expose access tokens to client code.
Never log tokens.
Always verify OAuth state.
Always check user ownership before publishing.
Always handle API errors.
Always store published pin IDs.
```

---

## 10. AI Integration Rules

AI code must be isolated in:

```txt
src/server/ai/
```

Recommended files:

```txt
src/server/ai/
├── ai-client.ts
├── ai.types.ts
├── providers/
│   ├── gemini.provider.ts
│   └── mock.provider.ts
└── prompts/
    ├── pin-ideas.prompt.ts
    ├── pin-draft.prompt.ts
    └── image-prompt.prompt.ts
```

Rules:

```txt
Validate AI output with Zod.
Never trust raw AI JSON.
Log generation attempts.
Handle invalid output gracefully.
Use provider abstraction.
Do not hardcode all logic to one AI provider.
```

---

## 11. Database Rules

Use Prisma with MySQL.

Prisma client must be centralized:

```txt
src/lib/prisma.ts
```

Rules:

```txt
No duplicate Prisma clients.
No direct Prisma calls in client components.
Use indexes for foreign keys and frequently filtered fields.
Use enums for statuses.
Use createdAt and updatedAt where relevant.
Always scope user-owned data.
```

Main models expected:

```txt
User
Project
PinterestAccount
PinterestBoard
Keyword
ContentIdea
PinDraft
PinAsset
ScheduledPin
PublishedPin
PinAnalytics
AiGenerationLog
ActivityLog
```

---

## 12. Authentication and Authorization Rules

Use Auth.js / NextAuth.

Rules:

```txt
Dashboard routes must require authentication.
Server actions must check session.
API routes must check session unless explicitly public callback routes.
Every project-scoped entity must verify ownership.
Never rely only on client-side checks.
```

Ownership examples:

```txt
A user can only access their own projects.
A user can only modify keywords inside their own projects.
A user can only publish their own approved pin drafts.
A user can only use their own Pinterest account and boards.
```

---

## 13. Environment Variables Rules

All environment variables must be declared in `.env.example`.

Required variables:

```txt
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
APP_URL=
PINTEREST_CLIENT_ID=
PINTEREST_CLIENT_SECRET=
PINTEREST_REDIRECT_URI=
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
REDIS_URL=
```

Rules:

```txt
Never hardcode secrets.
Never expose server secrets through NEXT_PUBLIC unless truly public.
Validate required env vars in src/lib/env.ts.
```

---

## 14. Status Enums

Use explicit status enums instead of random strings.

Project:

```txt
ACTIVE
PAUSED
ARCHIVED
```

Keyword:

```txt
NEW
USED
IGNORED
ARCHIVED
```

ContentIdea:

```txt
DRAFT
APPROVED
REJECTED
ARCHIVED
```

PinDraft:

```txt
DRAFT
APPROVED
SCHEDULED
PUBLISHED
FAILED
ARCHIVED
```

PinAsset:

```txt
GENERATING
READY
FAILED
ARCHIVED
```

ScheduledPin:

```txt
PENDING
PROCESSING
PUBLISHED
FAILED
CANCELLED
```

PublishedPin:

```txt
PUBLISHED
FAILED
DELETED
```

---

## 15. Routing Rules

Marketing:

```txt
/
/pricing
/features
```

Auth:

```txt
/login
/register
```

Dashboard:

```txt
/dashboard
/dashboard/projects
/dashboard/projects/[projectId]
/dashboard/projects/[projectId]/keywords
/dashboard/projects/[projectId]/ideas
/dashboard/projects/[projectId]/pins
/dashboard/projects/[projectId]/calendar
/dashboard/projects/[projectId]/analytics
/dashboard/settings
/dashboard/settings/pinterest
```

API:

```txt
/api/pinterest/oauth/start
/api/pinterest/oauth/callback
/api/pinterest/boards/sync
/api/pins/publish
/api/analytics/sync
/api/jobs/process
```

Rules:

```txt
Do not create random routes without purpose.
Keep routes clean and predictable.
Use projectId route param for project-scoped dashboard pages.
Validate route params with Zod when used in server actions or services.
```

---

## 16. UI Rules

Use a clean SaaS dashboard style.

Required layout elements:

```txt
Sidebar navigation
Topbar
Project switcher
User menu
Main content area
Responsive mobile behavior
```

Every main page must handle:

```txt
Loading state
Empty state
Error state
Success state when applicable
```

Preferred UI stack:

```txt
Tailwind CSS
shadcn/ui
lucide-react icons
```

Do not overcomplicate UI in early MVP.

---

## 17. Error Handling Rules

All critical operations must handle errors.

Operations:

```txt
Auth
Database writes
CSV import
AI generation
Image generation
Pinterest OAuth
Pinterest publishing
Analytics sync
Scheduling
```

Rules:

```txt
Show clean user-facing errors.
Log technical details server-side.
Do not expose raw stack traces.
Do not expose tokens or secrets.
Return typed action results.
```

Recommended action response pattern:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

---

## 18. Logging Rules

Use structured logs for important events.

Log events:

```txt
Project created
Keyword imported
AI generation started/failed/succeeded
Pinterest connected
Boards synced
Pin published
Publish failed
Analytics synced
```

Never log:

```txt
Access tokens
Refresh tokens
API keys
Passwords
Full private sessions
```

---

## 19. Rate Limit and Safety Rules

Create app-level limits in:

```txt
src/config/limits.ts
```

Initial safety defaults:

```txt
MAX_PINS_PER_HOUR_PER_USER = 5
MAX_PINS_PER_DAY_PER_USER = 25
MIN_MINUTES_BETWEEN_PINS = 10
MAX_RETRY_ATTEMPTS = 3
```

These are internal safety limits and may be adjusted later.

---

## 20. Development Order

Build in this order:

```txt
1. Setup project
2. Folder architecture
3. Prisma + MySQL
4. Auth
5. Dashboard shell
6. Projects module
7. Keywords module
8. AI client abstraction
9. Content ideas module
10. Pin drafts module
11. Image assets module
12. Pinterest OAuth
13. Boards sync
14. Manual publish
15. Scheduling
16. Analytics
17. Learning engine
18. Production hardening
```

Do not start with scheduling, analytics, or advanced automation before MVP foundation is stable.

---

## 21. AI Coding Assistant Protocol

Before coding, the AI must read:

```txt
PRD.md
ARCHITECTURE_RULES.md
CURRENT_TASK.md
```

Every prompt must define:

```txt
Current task
Allowed files
Forbidden files
Acceptance criteria
Technical constraints
```

The AI must not:

```txt
Rewrite unrelated modules
Modify architecture without request
Introduce unapproved dependencies
Remove validation
Skip auth checks
Expose secrets
Invent fake API behavior
Use browser automation
```

---

## 22. CURRENT_TASK.md Template

Use this template for every implementation step:

```md
# CURRENT_TASK.md

## Task
Describe the exact task here.

## Context
This project follows PRD.md and ARCHITECTURE_RULES.md.

## Allowed files
- path/to/allowed/files/**

## Forbidden files
- path/to/forbidden/files/**

## Requirements
- Requirement 1
- Requirement 2
- Requirement 3

## Acceptance Criteria
- Criterion 1
- Criterion 2
- Criterion 3

## Output Expected
- List of files created/updated
- Explanation of implementation
- Any required commands
```

---

## 23. Definition of Done

A task is done only when:

```txt
It respects PRD.md
It respects ARCHITECTURE_RULES.md
It only edits allowed files
It has Zod validation where needed
It checks auth and ownership where needed
It has no TypeScript errors
It has clear error handling
It has clean UI states when UI is involved
It does not expose secrets
It does not introduce unrelated features
```

---

## 24. Final Rule

When in doubt, choose:

```txt
Clean architecture
Small modules
Server-side safety
Official APIs
Human approval
Explicit validation
```

Reject any implementation that turns PinFlow OS into a fragile scraping bot.
