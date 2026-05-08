# PinFlow OS

A mini SaaS web application for AI-assisted Pinterest content generation, scheduling, publishing, and analytics.

> **IMPORTANT:** Before starting any AI coding session, ask the assistant to read `PROJECT_AGENT.md`, `PRD.md`, `ARCHITECTURE_RULES.md` and `CURRENT_TASK.md` first.

## Stack Summary
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Prisma with MySQL
- **Auth:** NextAuth (Auth.js)
- **Deployment:** Hostinger Node.js hosting or similar Node.js target

## Folder Structure
```txt
my-project/
  PROJECT_AGENT.md   # AI instructions (how to build)
  PRD.md             # Product requirements (what to build)
  README.md          # Project context
  package.json       # Dependencies & Scripts
  src/               # Application Source
    app/             # Next.js App Router root
    components/      # UI components
    lib/             # Utilities
    hooks/           # React hooks
    types/           # TypeScript definitions
    styles/          # Global styles (if separate)
```

## Database & Authentication Setup

To set up the database and authentication for development:

1. Ensure MySQL is running locally or specify a remote MySQL provider.
2. Setup environment variables in `.env`:
   ```bash
   cp .env.example .env
   # Update the values in .env with your real credentials
   ```
3. Initialize the Prisma database:
   ```bash
   npx prisma generate
   # If using a clean database schema, push it for the first time
   npx prisma db push
   # Or using migrations
   npx prisma migrate dev --name init_auth_foundation
   ```

## Getting Started Instructions

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

_TODO: Define necessary environment variables._
```env
# Placeholder for Hostinger MySQL credentials, Auth secrets, etc.
```

## Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles the application for production deployment.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Triggers ESLint analysis.
- `npm run typecheck`: Runs TypeScript compiler without emitting files.

## Development Workflow

1. Update the `PRD.md` for new features.
2. Ensure `PROJECT_AGENT.md` aligns with current development philosophy.
3. Keep changes surgical, localized, and easily reviewable.
4. Test and verify thoroughly.

## AI-Assisted Development Workflow

When delegating tasks to the AI:
- Direct the AI to internalize `PROJECT_AGENT.md` and `PRD.md`.
- Assign one specific task or feature at a time to reduce architectural drift.
- Request verification loops (`lint`, `build`) before closing task loops.

## Contribution / Development Rules

- Treat the `PROJECT_AGENT.md` as immutable technical law.
- Prioritize simplicity over abstraction.
- Enforce clean data architecture before touching the UI.

## Project Root Documentation

This project uses root documentation files to guide both human and AI-assisted development:

- `PROJECT_AGENT.md` — AI behavior, coding discipline, anti-hallucination, and verification rules.
- `PRD.md` — product requirements and source of truth for what must be built.
- `ARCHITECTURE_RULES.md` — technical architecture rules for folders, routing, components, server/client boundaries, data access, validation, security, and implementation patterns.
- `PROJECT_STATE.md` — current project status, progress, next steps, and verification state.
- `LESSONS_LEARNED.md` — known bugs, issues, root causes, fixes, and prevention rules.
- `DECISIONS.md` — validated decisions and reasoning.

## Current Task Workflow

This project uses `CURRENT_TASK.md` to control the active development phase.

`PRD.md` defines the full product vision, but `CURRENT_TASK.md` defines what is allowed right now.

Before starting any AI-assisted coding session, ask the assistant to read:

1. `PROJECT_AGENT.md`
2. `PRD.md`
3. `ARCHITECTURE_RULES.md`
4. `CURRENT_TASK.md`
5. `PROJECT_STATE.md`
6. `LESSONS_LEARNED.md`
7. `DECISIONS.md`

The assistant must not implement features outside the scope of `CURRENT_TASK.md`.

For Phase 0 — Foundation, the assistant must not start:

- authentication;
- Pinterest integration;
- AI generation workflows;
- database implementation;
- dashboard features;
- payment;
- scheduling automation;
- advanced product logic.
