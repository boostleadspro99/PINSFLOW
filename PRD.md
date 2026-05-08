# PRD.md — PinFlow OS

> **Source of Truth for AI-Assisted Development**  
> This document is the root product and architecture reference for the project.  
> Any AI coding assistant working on this repository must read and follow this PRD before generating, editing, refactoring, or deleting code.

---

## 1. Product Name

**Working name:** PinFlow OS  
**Alternative names:** Pinterest Growth OS, PinPilot AI, PinCraft AI

For development purposes, the default name is:

```txt
PinFlow OS
```

---

## 2. Product Vision

PinFlow OS is a clean, modular, AI-powered mini SaaS web application that helps users generate, organize, schedule, publish, and analyze Pinterest content.

The application transforms a user workflow like this:

```txt
Keyword → AI Pin Idea → Pin Draft → Image → Approval → Schedule → Publish → Analytics → Learning
```

The product is not a browser automation bot. It is a professional web dashboard that uses official APIs, safe server-side logic, structured queues, and AI generation workflows.

---

## 3. Core Goal

Build a web application that allows a user to:

1. Create Pinterest growth projects by niche.
2. Add or import keywords.
3. Generate Pinterest content ideas using AI.
4. Generate pin titles, descriptions, hashtags, overlay text, and image prompts.
5. Generate or attach Pinterest-ready images.
6. Connect a Pinterest account through OAuth.
7. Sync Pinterest boards.
8. Approve pin drafts manually.
9. Publish pins using the official Pinterest API.
10. Schedule pins for future publishing.
11. Track analytics.
12. Improve future content based on performance data.

---

## 4. Non-Negotiable Product Rules

### 4.1 No Browser Automation Bot

The app must not rely on:

```txt
Playwright login automation
Puppeteer login automation
Scraping private Pinterest pages
Anti-detection logic
Proxy rotation to bypass limits
Storing Pinterest passwords
Reusing browser cookies
Bypassing platform restrictions
```

### 4.2 Use Official Integration Pattern

The app must use:

```txt
Pinterest OAuth
Pinterest access tokens
Pinterest refresh tokens when available
Official Pinterest API endpoints
Server-side token storage
Server-side API calls
Rate limiting
Error handling
Logging
```

### 4.3 Human Approval First

The MVP must be semi-automated first.

The user must review and approve pin drafts before publication.

Full automation may be introduced later only after:

```txt
approval workflow is stable
rate limits are implemented
logging is implemented
analytics are tracked
safety limits exist
```

### 4.4 Modular Architecture

The project must follow a modular monolith architecture. Each business domain must have its own feature folder, schemas, services, actions, queries, components, and types.

### 4.5 Clean Code First

The project must prioritize:

```txt
TypeScript strict mode
Zod validation
Small files
Clear naming
Clear routing
No business logic in React UI components
No direct Prisma access inside UI components
No secrets exposed to client code
Server-side security boundaries
Reusable patterns
```

---

## 5. Target Users

### 5.1 Primary User

A content creator, blogger, affiliate marketer, SEO operator, or small business owner who wants to grow traffic from Pinterest.

### 5.2 Secondary User

A marketing operator or agency managing multiple Pinterest niches or content campaigns.

### 5.3 Future User Type

A SaaS customer managing multiple brands, users, or Pinterest accounts.

Team and billing features are not required in the first MVP.

---

## 6. MVP Definition

The first MVP must focus on a safe and useful Pinterest content assistant.

### MVP Core Workflow

```txt
Create project
→ Add keywords
→ Generate pin drafts with AI
→ Generate or upload image
→ Connect Pinterest account
→ Sync boards
→ Approve draft
→ Publish manually through API
→ Store published pin data
```

### MVP Required Features

1. Authentication.
2. Protected dashboard.
3. Project/niche management.
4. Keyword management.
5. AI pin draft generation.
6. Image generation or image upload support.
7. Pinterest OAuth connection.
8. Pinterest boards sync.
9. Manual pin publishing.
10. Basic activity logs.

### MVP Not Required Yet

The following features are not required in MVP 1:

```txt
Billing
Team accounts
Advanced user roles
Multi-account Pinterest management
Complex drag-and-drop calendar
Full automatic scheduling
Advanced analytics dashboard
AI learning engine
Public API
Browser extension
Mobile app
```

---

## 7. Recommended Tech Stack

### 7.1 Application

```txt
Framework: Next.js App Router
Language: TypeScript
UI: React
Styling: Tailwind CSS
Components: shadcn/ui
Validation: Zod
Authentication: Auth.js / NextAuth
Database: MySQL
ORM: Prisma
Image storage: Cloudinary or Cloudflare R2
Queue: Redis + BullMQ, later phase
Worker: Node.js worker, later phase
AI provider: Gemini first, optional provider abstraction
Pinterest: Official Pinterest API
```

### 7.2 Hosting Recommendation

For MVP development:

```txt
Local development first
MySQL local or Hostinger MySQL
Cloudinary for image hosting
```

For production:

```txt
VPS preferred if using workers and queues
Separate Redis service if scheduling is enabled
Secure environment variables
Database backups
```

---

## 8. Repository Architecture

The project must use a clean and predictable structure.

```txt
pinflow-os/
│
├── PRD.md
├── README.md
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   └── pricing/page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── dashboard/projects/page.tsx
│   │   │   ├── dashboard/projects/[projectId]/page.tsx
│   │   │   ├── dashboard/projects/[projectId]/keywords/page.tsx
│   │   │   ├── dashboard/projects/[projectId]/ideas/page.tsx
│   │   │   ├── dashboard/projects/[projectId]/pins/page.tsx
│   │   │   ├── dashboard/projects/[projectId]/calendar/page.tsx
│   │   │   ├── dashboard/projects/[projectId]/analytics/page.tsx
│   │   │   └── dashboard/settings/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── pinterest/oauth/start/route.ts
│   │   │   ├── pinterest/oauth/callback/route.ts
│   │   │   ├── pinterest/boards/sync/route.ts
│   │   │   ├── pins/publish/route.ts
│   │   │   ├── analytics/sync/route.ts
│   │   │   └── jobs/process/route.ts
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── keywords/
│   │   ├── content-ideas/
│   │   ├── pin-drafts/
│   │   ├── pin-assets/
│   │   ├── pinterest/
│   │   ├── scheduler/
│   │   ├── analytics/
│   │   ├── activity-logs/
│   │   └── settings/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   └── shared/
│   │
│   ├── server/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── queries/
│   │   ├── ai/
│   │   ├── pinterest/
│   │   ├── jobs/
│   │   └── db/
│   │
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   ├── utils.ts
│   │   └── errors.ts
│   │
│   ├── config/
│   │   ├── app.ts
│   │   ├── pinterest.ts
│   │   ├── ai.ts
│   │   └── limits.ts
│   │
│   └── types/
│
└── worker/
    ├── index.ts
    ├── queues/
    ├── processors/
    └── jobs/
```

The `worker/` folder may be created later when scheduling is implemented.

---

## 9. Feature Folder Pattern

Each feature must follow this structure when applicable:

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
src/features/keywords/
├── components/
│   ├── KeywordTable.tsx
│   ├── KeywordForm.tsx
│   └── KeywordImportCsv.tsx
├── actions/
│   ├── create-keyword.action.ts
│   ├── update-keyword.action.ts
│   └── import-keywords.action.ts
├── services/
│   └── keyword.service.ts
├── schemas/
│   └── keyword.schema.ts
├── queries/
│   └── keyword.queries.ts
├── types/
│   └── keyword.types.ts
└── utils/
    └── keyword-score.ts
```

---

## 10. Code Responsibility Rules

### 10.1 UI Components

UI components must:

```txt
Render UI
Receive typed props
Use small local UI state only
Call server actions through forms or client handlers
Never access Prisma directly
Never contain business logic
Never expose secrets
```

### 10.2 Server Actions

Server actions must:

```txt
Validate input with Zod
Check authentication
Check ownership
Call services
Return predictable success/error objects
Avoid duplicated business logic
```

### 10.3 Services

Services must:

```txt
Contain business logic
Orchestrate database writes
Call external APIs
Handle domain rules
Throw typed errors or return typed results
```

### 10.4 Queries

Queries must:

```txt
Read data from database
Scope data by user/project ownership
Return typed data
Avoid mutations
```

### 10.5 Schemas

Schemas must:

```txt
Use Zod
Validate user inputs
Be reused across forms, actions, and API routes
```

---

## 11. Application Routing

### 11.1 Marketing Routes

```txt
/
/pricing
/features
```

### 11.2 Auth Routes

```txt
/login
/register
```

### 11.3 Dashboard Routes

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

### 11.4 API Routes

```txt
/api/pinterest/oauth/start
/api/pinterest/oauth/callback
/api/pinterest/boards/sync
/api/pins/publish
/api/analytics/sync
/api/jobs/process
```

Route Handlers must be server-only. They must validate authentication and ownership before performing sensitive operations.

---

## 12. Core Data Model

The database must support the following main entities.

### 12.1 User

Represents an application user.

Main fields:

```txt
id
name
email
image
role
createdAt
updatedAt
```

Roles:

```txt
USER
ADMIN
```

### 12.2 Project

Represents a Pinterest niche or content project.

Main fields:

```txt
id
userId
name
slug
description
language
country
targetAudience
defaultWebsiteUrl
status
createdAt
updatedAt
```

Status values:

```txt
ACTIVE
PAUSED
ARCHIVED
```

### 12.3 PinterestAccount

Stores Pinterest OAuth account connection data.

Main fields:

```txt
id
userId
pinterestUserId
username
accessTokenEncrypted
refreshTokenEncrypted
tokenExpiresAt
scopes
status
createdAt
updatedAt
```

Sensitive tokens must be encrypted or securely stored server-side.

### 12.4 PinterestBoard

Stores synced Pinterest boards.

Main fields:

```txt
id
userId
pinterestAccountId
pinterestBoardId
name
description
url
privacy
createdAt
updatedAt
```

### 12.5 Keyword

Stores keywords by project.

Main fields:

```txt
id
projectId
term
language
source
intent
searchVolume
difficulty
trendScore
performanceScore
status
createdAt
updatedAt
```

Source values:

```txt
MANUAL
CSV
AI
SEO_TOOL
GOOGLE_SUGGEST
PINTEREST_TRENDS_MANUAL
```

Status values:

```txt
NEW
USED
IGNORED
ARCHIVED
```

### 12.6 ContentIdea

Stores AI-generated content angles from keywords.

Main fields:

```txt
id
projectId
keywordId
title
angle
audience
format
aiScore
status
createdAt
updatedAt
```

Format values:

```txt
LISTICLE
HOW_TO
CHECKLIST
QUOTE
INFOGRAPHIC
RECIPE
BEFORE_AFTER
GUIDE
TIPS
```

Status values:

```txt
DRAFT
APPROVED
REJECTED
ARCHIVED
```

### 12.7 PinDraft

Stores generated pin content before publishing.

Main fields:

```txt
id
projectId
keywordId
contentIdeaId
boardId
title
description
overlayText
imagePrompt
hashtags
targetUrl
qualityScore
status
createdAt
updatedAt
```

Status values:

```txt
DRAFT
APPROVED
SCHEDULED
PUBLISHED
FAILED
ARCHIVED
```

### 12.8 PinAsset

Stores generated or uploaded images.

Main fields:

```txt
id
pinDraftId
imageUrl
storageProvider
aiProvider
prompt
width
height
status
createdAt
updatedAt
```

Status values:

```txt
GENERATING
READY
FAILED
ARCHIVED
```

### 12.9 ScheduledPin

Stores future publishing jobs.

Main fields:

```txt
id
pinDraftId
projectId
scheduledAt
status
attemptCount
lastError
createdAt
updatedAt
```

Status values:

```txt
PENDING
PROCESSING
PUBLISHED
FAILED
CANCELLED
```

### 12.10 PublishedPin

Stores published Pinterest pins.

Main fields:

```txt
id
pinDraftId
pinterestPinId
pinterestUrl
publishedAt
status
createdAt
updatedAt
```

Status values:

```txt
PUBLISHED
FAILED
DELETED
```

### 12.11 PinAnalytics

Stores performance metrics.

Main fields:

```txt
id
publishedPinId
impressions
saves
clicks
outboundClicks
engagementRate
ctr
saveRate
collectedAt
createdAt
```

### 12.12 AiGenerationLog

Stores AI generation logs for traceability.

Main fields:

```txt
id
userId
projectId
provider
model
taskType
input
output
status
error
createdAt
```

### 12.13 ActivityLog

Stores user and system actions.

Main fields:

```txt
id
userId
projectId
action
entityType
entityId
message
metadata
createdAt
```

---

## 13. Core User Flows

### 13.1 Create Project Flow

```txt
User opens dashboard
→ Clicks Create Project
→ Enters niche details
→ Server validates with Zod
→ Project is created
→ User is redirected to project dashboard
```

Acceptance criteria:

```txt
Project belongs to authenticated user
Slug is unique per user
Invalid inputs show errors
User cannot access another user's project
```

### 13.2 Add Keywords Flow

```txt
User opens project keywords page
→ Adds keyword manually or imports CSV
→ Keywords are validated
→ Duplicates are ignored or merged
→ Keywords appear in table
```

Acceptance criteria:

```txt
Empty terms rejected
Duplicate terms handled safely
Keywords scoped by project
CSV import has validation and error display
```

### 13.3 Generate Pin Draft Flow

```txt
User selects a keyword
→ Clicks Generate Pin Ideas
→ AI generates content ideas
→ User selects idea
→ AI generates pin draft
→ Pin draft is saved with status DRAFT
```

Acceptance criteria:

```txt
AI output is validated
Failed generations are logged
No invalid JSON breaks the app
Draft is linked to project and keyword
```

### 13.4 Generate Image Flow

```txt
User opens a PinDraft
→ Clicks Generate Image
→ App sends image prompt to provider
→ Image is generated
→ Image is uploaded to storage
→ PinAsset is attached to PinDraft
```

Acceptance criteria:

```txt
Image has valid URL
Image is attached to correct draft
Image generation failures are logged
No provider secret exposed to client
```

### 13.5 Connect Pinterest Flow

```txt
User opens settings
→ Clicks Connect Pinterest
→ Redirects to Pinterest OAuth
→ Pinterest redirects to callback
→ App stores tokens server-side
→ App syncs boards
```

Acceptance criteria:

```txt
No Pinterest password is requested
OAuth state is validated
Tokens are not exposed to client
Boards are synced and visible
Errors are handled clearly
```

### 13.6 Publish Pin Flow

```txt
User opens approved draft
→ Selects board
→ Clicks Publish
→ Server verifies ownership and tokens
→ Server calls Pinterest API
→ PublishedPin is created
→ PinDraft status becomes PUBLISHED
```

Acceptance criteria:

```txt
Only approved drafts can be published
Draft must have title, description, target URL, board, and image
Pinterest API errors are saved
Published pin URL is stored
```

---

## 14. AI Generation Rules

### 14.1 AI Provider Abstraction

The code must not hardcode the app to one AI provider everywhere.

Create a provider abstraction:

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

### 14.2 AI Output Validation

All AI structured outputs must be validated using Zod before being stored.

If the AI output is invalid:

```txt
Do not crash the app
Log the raw output
Return a clean error to the user
Allow retry
```

### 14.3 AI Prompt Requirements

Prompts must include:

```txt
Project niche
Target audience
Language
Country
Keyword
Content format
Brand tone
Pinterest best practices
Expected JSON schema
Forbidden outputs
```

### 14.4 Forbidden AI Behavior

AI must not:

```txt
Invent unavailable analytics
Invent Pinterest API response data
Generate unsafe claims
Generate misleading clickbait
Generate content unrelated to the project niche
Modify unrelated files during coding tasks
```

---

## 15. Pinterest Integration Rules

### 15.1 OAuth Only

Pinterest connection must use OAuth. The app must never ask for Pinterest login credentials.

### 15.2 Token Safety

Tokens must be:

```txt
Stored server-side only
Never exposed in client components
Never logged in plain text
Encrypted or protected when possible
Rotated/refreshed correctly
```

### 15.3 API Client Pattern

Pinterest API code must be isolated:

```txt
src/server/pinterest/
├── pinterest-client.ts
├── pinterest-oauth.ts
├── pinterest-boards.ts
├── pinterest-pins.ts
├── pinterest-analytics.ts
└── pinterest.types.ts
```

### 15.4 Rate Limiting

The app must have a rate limit configuration:

```txt
src/config/limits.ts
```

Initial safe limits:

```txt
MAX_PINS_PER_HOUR_PER_USER = 5
MAX_PINS_PER_DAY_PER_USER = 25
MIN_MINUTES_BETWEEN_PINS = 10
MAX_RETRY_ATTEMPTS = 3
```

These are application safety defaults, not official Pinterest limits.

---

## 16. Security Requirements

### 16.1 Authentication

Protected routes must require authenticated user sessions.

### 16.2 Authorization

Every user-owned entity must be scoped by user ownership.

Required checks:

```txt
User can only access own projects
User can only access own keywords
User can only access own drafts
User can only publish own drafts
User can only use own Pinterest account
```

### 16.3 Input Validation

All external input must be validated using Zod.

Applies to:

```txt
Forms
Server actions
API routes
CSV imports
AI outputs
Webhook payloads
Query params
Route params
```

### 16.4 Environment Variables

No secrets in source code.

Required `.env.example` variables:

```txt
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
PINTEREST_CLIENT_ID=
PINTEREST_CLIENT_SECRET=
PINTEREST_REDIRECT_URI=
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
REDIS_URL=
APP_URL=
```

### 16.5 Logging Rules

Logs must never include:

```txt
Access tokens
Refresh tokens
API secrets
Full user sessions
Passwords
Raw private credentials
```

---

## 17. UI/UX Requirements

### 17.1 Design Style

The app must use a clean SaaS dashboard style:

```txt
Modern
Minimal
Professional
Fast
Mobile-friendly
Clear hierarchy
Good spacing
Readable typography
```

### 17.2 Dashboard Layout

Dashboard should include:

```txt
Sidebar navigation
Top bar
Project switcher
User menu
Main content area
Responsive mobile layout
```

### 17.3 Main Dashboard Cards

Overview page should show:

```txt
Total projects
Draft pins
Approved pins
Scheduled pins
Published pins
Pinterest connection status
Recent activity
```

### 17.4 Empty States

Every important page must have clean empty states.

Examples:

```txt
No projects yet → Create your first project
No keywords yet → Add keywords or import CSV
No Pinterest account → Connect Pinterest
No drafts yet → Generate your first pin draft
```

---

## 18. Performance Requirements

The app must be fast and clean.

Requirements:

```txt
Avoid unnecessary client components
Use Server Components by default
Use client components only for interactivity
Paginate large tables
Avoid loading all project data at once
Optimize images
Use proper loading states
Use Suspense where useful
```

---

## 19. Error Handling Requirements

All critical operations must handle errors gracefully.

Applies to:

```txt
Database operations
OAuth callback
AI generation
Image generation
Pinterest API calls
CSV import
Publish action
Analytics sync
```

User-facing errors must be clear but not expose sensitive internals.

Example:

```txt
Good: Could not publish this pin. Please check your Pinterest connection and try again.
Bad: OAuth token error: invalid_grant stack trace...
```

---

## 20. Development Phases

### Phase 0 — Foundation

Goal: create clean project base.

Tasks:

```txt
Initialize Next.js App Router
Enable TypeScript strict
Install Tailwind CSS
Install shadcn/ui
Create clean folder structure
Create environment config
Create README
Create PRD.md
```

Done when:

```txt
App runs locally
No TypeScript errors
Base layout works
Folder structure exists
```

### Phase 1 — Database + Auth

Goal: create SaaS foundation.

Tasks:

```txt
Install Prisma
Configure MySQL
Create user/session models
Configure Auth.js
Protect dashboard
Create login page
Create session helper
```

Done when:

```txt
User can log in
Dashboard is protected
Unauthenticated user is redirected
```

### Phase 2 — Dashboard Shell

Goal: create main app interface.

Tasks:

```txt
Sidebar
Topbar
Dashboard layout
Project switcher placeholder
Settings page placeholder
Empty overview cards
```

Done when:

```txt
Dashboard navigation works
Layout is responsive
```

### Phase 3 — Projects Module

Goal: manage niches/projects.

Tasks:

```txt
Create project schema
Create project actions
Create project queries
Create project table
Create project form
Create project detail page
```

Done when:

```txt
User can create, view, update, and archive projects
```

### Phase 4 — Keywords Module

...

---
*(truncated later phases out of this update as it continues, but I am replacing the full file)*