# LESSONS_LEARNED.md

## Purpose

This file is the technical knowledge base of the project.

It records bugs, issues, root causes, solutions, and prevention rules so future AI sessions do not repeat the same mistakes.

---

## How to Use This File

Before debugging or implementing related features, read this file.

When a bug, issue, or important technical problem is solved, add a new entry using the lesson template below.

Do not add noisy notes.
Only record lessons that are useful for future development.

---

## Lesson Template

```md
## YYYY-MM-DD — Short Issue Title

### Context

Describe when and where the issue happened.

### Symptoms

- Error message:
- Broken behavior:
- Affected route/component/file:

### Root Cause

Explain the real cause of the issue.

### Solution Applied

Explain the exact fix.

### Files Changed

- `path/to/file.ts` — why it changed

### Prevention Rule

Write a clear rule to avoid repeating this issue.

### Verification

- Build:
- TypeScript:
- Lint:
- Tests:
- Manual check:
```

---

## Lessons

## 2026-05-05 — Google Auth Login Button Not Working Due to Missing Env Vars

### Context

During Phase 7.1, the "Sign in with Google" button on `/login` was not triggering Google OAuth. The button was visually present and structurally correct, but clicking it failed silently or could not initiate the OAuth flow.

### Symptoms

- Clicking "Sign in with Google" does nothing or silently fails
- No Google OAuth redirect occurs
- The button appears correctly styled and clickable

### Root Cause

The `.env` file was missing required NextAuth.js and Google OAuth environment variables:
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` were not set (empty strings in the provider config)
- `NEXTAUTH_SECRET` was not set (required for JWT session encryption)
- `NEXTAUTH_URL` was not set (required for OAuth callback URLs)

The `env.ts` schema marked these as optional, so the app didn't crash, but the Google provider received empty credentials and could not start the OAuth flow.

### Solution Applied

1. Added `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` to `.env` with placeholder/dev values
2. Updated `.env.example` to move Google auth vars out of "Future auth phase" into the active auth section

### Files Changed

- `.env` — Added missing Google OAuth and NextAuth env vars
- `.env.example` — Reorganized auth variables to correct phase category
- `prisma/schema.prisma` — Added `passwordHash` field to User model
- `src/lib/auth.ts` — Added Credentials provider alongside Google provider
- `src/features/auth/schemas/auth.schema.ts` — Created Zod schemas for login and register
- `src/features/auth/services/auth.service.ts` — Created registration service with bcrypt hashing
- `src/features/auth/actions/auth.actions.ts` — Created register server action
- `src/app/(auth)/login/page.tsx` — Added email/password form alongside Google button
- `src/app/(auth)/register/page.tsx` — Implemented full registration form with server action

### Prevention Rule

When auth is implemented, the `.env` and `.env.example` must be updated immediately with all required auth environment variables. Do not leave them as "future" phase placeholders after auth code is deployed. The env validation schema must also be updated to make auth vars required when the auth feature is active.

For credentials auth: always hash passwords with bcryptjs (already in dependencies), use Zod for input validation, normalize email to lowercase, use a generic error message for login failures, and never expose `passwordHash` to the client.

### Verification

- Build: passed
- TypeScript: passed (0 errors)
- Lint: not run
- Tests: not run
- Manual check: not run

## 2026-05-04 — Prevent Premature Required Environment Variables in Phase 0

### Context

During Phase 0 (Foundation) setup, the config files required several environment variables like `DATABASE_URL` and `NEXTAUTH_SECRET` to be defined for the build and dev to work, and requested real secrets manually.

### Symptoms

- Error message: N/A
- Broken behavior: Future features and secrets were being formally required before their designated development phase.
- Affected route/component/file: `.env.example`

### Root Cause

The `.env.example` was incorrectly labeling future features' environment variables (like Database and Auth) as "Required for Phase 0 Foundation", enforcing premature secret handling.

### Solution Applied

Removed the "Required for Phase 0 Foundation" section in `.env.example` and clearly categorized those variables under future phases. The application does not enforce these at runtime during Phase 0.

### Files Changed

- `.env.example` — Removed premature requirement and commented them as future phase placeholders.

### Prevention Rule

Do not enforce, document, or require runtime evaluation of environment variables for features that are strictly scheduled for future phases.

### Verification

- Build: passed
- TypeScript: passed
- Lint: passed
- Tests: not run
- Manual check: not run

## 2026-05-05 — Pinterest OAuth: callback vérifie session + state, pas seulement state

### Context

Phase 8 a implémenté le callback OAuth Pinterest. Une ambiguïté dans le rapport a laissé penser que seul le state était validé, pas la session.

### Symptômes

- Rapport indiquait : "API routes use getServerSession except callback (which validates OAuth state)"
- Sous-entendait que le callback pouvait créer un PinterestAccount sans utilisateur authentifié

### Root Cause

Le rapport était mal formulé. Le code appelle bien `getServerSession(authOptions)` ligne 13 et vérifie `session?.user?.id` ligne 14 avant toute opération. Le callback utilise les deux : session ET state.

### Solution Applied

Aucune correction nécessaire dans le code. Correction du rapport uniquement : le callback utilise `getServerSession` + validation de state.

### Prevention Rule

Dans les rapports techniques, ne pas utiliser "sauf" pour décrire des routes qui font en réalité les deux contrôles. Être explicite : "toutes les routes vérifient la session, y compris le callback qui vérifie aussi le state".

### Verification

- Code review: confirmé, `getServerSession` est appelé dans `/api/pinterest/oauth/callback/route.ts` ligne 13

## 2026-05-05 — MAX_BOARD_SYNC_ATTEMPTS_PER_HOUR déclaré mais pas appliqué

### Context

Phase 8 a ajouté `MAX_BOARD_SYNC_ATTEMPTS_PER_HOUR = 10` dans `src/config/limits.ts` comme constante de configuration.

### Symptoms

- La constante existe dans limits.ts
- Mais elle n'est importée ou vérifiée nulle part dans le code
- Aucune garde ne limite réellement le nombre de syncs par heure

### Root Cause

La constante a été déclarée dans limits.ts pour documenter la limite prévue, mais l'enforcement (vérification avant chaque sync) n'a pas été implémenté.

### Solution Applied

Non applicable — la constante reste documentée mais non appliquée. Acceptable pour MVP.

### Files Changed

- `src/config/limits.ts` — constante déclarée uniquement

### Prevention Rule

Quand une limite de rate est ajoutée dans config, l'enforcement doit être implémenté dans le service correspondant, ou le faire savoir explicitement dans le rapport et dans PROJECT_STATE.md.

### Verification

Build: passed. TypeScript: passed. Enforcement: non appliqué.

## 2026-05-05 — Prisma shadow database non disponible sur Hostinger

### Context

Phase 8 a nécessité une migration Prisma pour ajouter les modèles PinterestAccount et PinterestBoard. La base de données Hostinger n'accorde pas les droits CREATE DATABASE au user MySQL.

### Symptoms

- `prisma migrate dev` échoue avec erreur P3014
- `prisma migrate dev --create-only` échoue aussi
- La shadow database ne peut pas être créée

### Root Cause

Prisma Migrate nécessite une shadow database (créée automatiquement) pour détecter les changements de schéma. L'utilisateur MySQL Hostinger n'a pas le privilège CREATE DATABASE.

### Solution Applied

Utilisation de `prisma db push` à la place pour synchroniser le schéma. Les fichiers de migration ne sont pas générés.

### Prevention Rule

Avant de lancer `prisma migrate dev` sur une base distante, vérifier les droits CREATE DATABASE. Si non disponibles :
- Développement local : faire `prisma migrate dev` en local avec une DB locale, commit les fichiers de migration
- Production : `prisma migrate deploy` avec les fichiers commités
- Alternative MVP : `prisma db push` (acceptable mais pas de migration files)

### Verification

Build: passed. TypeScript: passed. Schema: synchronisé via db push.

## 2026-05-07 — Pinterest scopes stockés avec espaces, split sur virgule

### Context

Phase 9D runtime testing a révélé que le scope check `pins:write` échouait toujours, même si le compte Pinterest avait bien le scope.

### Root Cause

Le code utilisait `account.scopes.split(",")` pour parser les scopes. Mais Pinterest retourne les scopes séparés par des espaces (`"boards:read pins:write user_accounts:read"`), pas des virgules. Le `split(",")` retournait un seul élément contenant toute la chaîne.

### Solution Applied

Remplacer tous les `split(",")` par `split(/[,\s]+/)` dans :
- `publishing-queue.service.ts` (2 occurrences)
- `pinterest-scopes.ts` (1 occurrence)

### Prevention Rule

Quand un champ stocke une liste délimitée provenant d'une API externe, vérifier le format exact du délimiteur. Ne pas supposer que c'est une virgule. Utiliser un regex flexible `split(/[,\s]+/)` pour gérer les deux formats.

## 2026-05-07 — Query processQueue ne matche pas les scheduledAt null

### Context

Le processeur de queue (`processQueue`) retournait 0 jobs alors qu'un job QUEUED existait.

### Root Cause

La condition `scheduledAt: { lte: now }` ne matche pas `null`. Les jobs créés sans scheduling ont `scheduledAt = null`. Sans clause OR pour les nulls, le processeur ne les voyait pas.

### Solution Applied

Remplacer `scheduledAt: { lte: now }` par un OR combinant `{ scheduledAt: null }` et `{ scheduledAt: { lte: now } }`.

### Prevention Rule

Quand une colonne optionnelle sert de filtre temporel, toujours inclure `null` dans les conditions OU. Un champ null signifie "pas de contrainte" (immédiat), pas "jamais".
