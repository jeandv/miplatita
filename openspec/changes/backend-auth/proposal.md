---
change: backend-auth
phase: proposal
status: complete
created: 2026-06-19
depends_on: [explore]
---

# Proposal: Backend API + Authentication + Guest Mode

## Intent

miplatita is a client-side-only personal finance app where all data lives in localStorage. This makes it impossible to access data across devices, creates data loss risk, and prevents future features like shared budgets or notifications. This change adds a backend with authentication while preserving the current localStorage experience as a fully functional guest mode.

## Scope

### In Scope
- Hono REST API server in `server/` directory with CRUD endpoints for accounts, transactions, and custom categories
- Better Auth integration with email/password registration (no email verification)
- Neon PostgreSQL database with Drizzle ORM schema and migrations
- Database sessions (Better Auth default)
- Guest mode: app works without login using localStorage (current behavior preserved)
- Authenticated mode: data persists to server, scoped by userId
- Data import endpoint: migrate localStorage data to server after registration
- Dev environment: Vite proxy + concurrently for dual-process setup
- Auth middleware protecting all `/api/` routes except auth endpoints

### Out of Scope
- Email verification and password reset (deferred — requires email provider)
- OAuth providers (Google, GitHub) — future enhancement
- Real-time sync or offline-first with conflict resolution
- Settings migration to database (theme/privacy stay in localStorage)
- Production deployment configuration (Vercel, Cloudflare, etc.)
- Shared budgets or multi-user features

## Approach

**Dual-mode architecture**: The app operates in two modes determined by auth state.

1. **Guest mode** (no auth): Current localStorage behavior, unchanged. All pure business logic in `finance-store.ts` continues working as-is.
2. **Authenticated mode**: `useFinance.ts` hooks switch from localStorage to API calls. Optimistic update pattern stays identical — only the persistence target changes.

**Backend stack**: Hono + Better Auth + Drizzle ORM + Neon PostgreSQL, all in a `server/` directory within the same package. Better Auth manages `user`, `session`, and `account` tables. Our domain uses `finance_account`, `transaction`, and `custom_category` tables with `userId` FK and `ON DELETE CASCADE`.

**Migration flow**: After first login, if localStorage has data, offer import via `/api/finance/import`. Server assigns userId, preserves existing UUIDs (already valid PostgreSQL UUIDs). Clear localStorage after successful import.

**Key complexity**: The hooks layer (`useFinance.ts`) needs conditional logic — check auth state to decide localStorage vs API. This is the main refactoring surface.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/` | New | Entire backend: Hono app, routes, DB schema, auth config, middleware |
| `src/hooks/useFinance.ts` | Modified | Dual-mode: localStorage (guest) vs API (authenticated) |
| `src/lib/storage.ts` | Modified | Kept as guest-mode fallback, add export helpers for migration |
| `src/lib/query-keys.ts` | Modified | Expand for granular per-resource queries |
| `vite.config.ts` | Modified | Add dev proxy for `/api/` → localhost:3001 |
| `package.json` | Modified | New dependencies, new scripts (dev:server, db:*) |
| `tsconfig.server.json` | New | Separate TypeScript config for server code |
| `drizzle.config.ts` | New | Drizzle Kit configuration |
| `.env` | New | DATABASE_URL, BETTER_AUTH_SECRET |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Better Auth API changes (newer library) | Low | Pin version, monitor changelog |
| Dual-mode hooks complexity | Medium | Clean abstraction layer — persistence strategy pattern behind a single interface |
| Money precision (JS number vs numeric(12,2)) | Medium | Use string representation for amounts in API responses, parse on client |
| localStorage import data integrity | Low | Validate and sanitize all imported data server-side, run in transaction |
| CORS issues in production | Low | Hono CORS middleware, configure allowed origins |

## Rollback Plan

1. The frontend's localStorage path remains fully functional — guest mode IS the rollback.
2. Server code is entirely in `server/` — delete the directory to remove backend.
3. Revert `useFinance.ts` hook changes to restore localStorage-only behavior.
4. Remove new dependencies from `package.json`.
5. Database can be dropped independently (Neon dashboard or `drizzle-kit drop`).

No data loss risk: localStorage data is never deleted until server import is confirmed successful.

## Dependencies

**Runtime**: `hono`, `@hono/node-server`, `better-auth`, `drizzle-orm`, `@neondatabase/serverless`
**Dev**: `tsx`, `concurrently`, `drizzle-kit`, `dotenv`
**External**: Neon PostgreSQL database instance (free tier available)

## Success Criteria

- [ ] User can register with email/password and log in
- [ ] Authenticated user can CRUD accounts, transactions, and categories via API
- [ ] All API data is scoped to the authenticated user (no cross-user data leaks)
- [ ] Guest mode works identically to current app (no regression)
- [ ] Existing localStorage data can be imported after first login
- [ ] Dev environment runs with a single `npm run dev` command
- [ ] Database sessions are created, validated, and expired correctly

## Timeline Estimate

| Phase | Description | Effort |
|-------|-------------|--------|
| 1. Server foundation | Hono app, DB schema, Drizzle config, Better Auth setup | 1-2 days |
| 2. API routes | CRUD endpoints + auth middleware + import endpoint | 1 day |
| 3. Frontend integration | Dual-mode hooks, auth UI (login/register), session management | 1-2 days |
| 4. Migration flow | Import dialog, localStorage-to-server migration | 0.5 day |
| 5. Testing & polish | End-to-end flow, edge cases, error handling | 1 day |
