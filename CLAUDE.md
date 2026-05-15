# CLAUDE.md — Tokens_taken

## Project Context

Tokens_taken is a B2B currency management platform (like a lightweight, modern ERP). The current codebase is a React 18 + Vite + Tailwind v4 frontend prototype (exported from Figma Make). The **target architecture** is a monorepo with Next.js frontend, NestJS backend, PostgreSQL + Prisma, and Redis.

## Architecture

- **Monorepo workspace** with 6 feature packages under `features/`, 3 shared packages under `packages/`, and 2 app entries under `apps/`
- **Strict feature isolation**: Features can only import from `packages/`, never from other features
- **Full architecture documented** in:
  - `docs/architecture/SYSTEM_ARCHITECTURE.md` — architecture diagram, database schema, auth flow, UX/UI recommendations
  - `docs/rules/TASK_ISOLATION_RULES.md` — isolation rules for 6 parallel tasks
  - `docs/guidelines/PROJECT_GUIDELINES.md` — TypeScript, React, NestJS, testing standards

## Current Status

- [x] Monorepo folder structure created
- [x] Feature stubs created (auth, invoice, transaction, dashboard, command-palette, reports)
- [x] Shared packages created (shared-types, common-utils, db)
- [x] Prisma schema with full financial models
- [x] Task isolation rules documented
- [x] Project guidelines documented
- [ ] **apps/frontend** — migrate from Vite to Next.js (planned)
- [ ] **apps/backend** — NestJS backend not yet scaffolded
- [ ] **Task 1-6** — features not yet implemented

## Key Rules

1. **Never import cross-feature** — use `packages/shared-types` as the bridge
2. **All financial operations** must use Prisma `$transaction` with `Serializable` isolation
3. **Use path aliases** (`@features/...`, `@packages/...`) — not relative paths
4. **Decimal for money** — never use `number` for currency amounts
5. **AuditLog is append-only** — never UPDATE or DELETE
6. **Conventional commits** — `feat(task-N):`, `fix(task-N):`, etc.

## Quick Commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to DB
pnpm db:push

# Seed development data
pnpm db:seed

# Type check
pnpm typecheck

# Run tests
pnpm test
```

## Tech Stack (Target)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind v4, React Query |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL 16, Prisma 5 |
| Cache | Redis 7 |
| Auth | Magic Link (Resend) + WebAuthn (simple-webauthn) |
| Real-time | Socket.IO |
| Storage | AWS S3 |
| Deployment | Vercel (frontend) + AWS ECS (backend) |
