---
change: backend-auth
phase: explore
status: complete
created: 2026-06-19
---

# Exploration: Backend API + Authentication + Database

## Current State

The app is a 100% client-side React 19 SPA for personal finance tracking. All data lives in localStorage under `miplatita-finance-v1` (JSON blob of `FinanceData`). Settings use separate keys (`miplatita-theme`, `miplatita-hide-amounts`).

### Architecture Summary

- **Data types** (`src/types/finance.ts`): `Account`, `Transaction`, `CustomCategory`, `FinanceData` — all with string IDs via `crypto.randomUUID()`.
- **Storage** (`src/lib/storage.ts`): `loadFinanceData()` / `saveFinanceData()` — direct localStorage read/write. `generateId()` uses `crypto.randomUUID()`.
- **Business logic** (`src/lib/finance-store.ts`): Pure functions that take `FinanceData` + input and return new `FinanceData`. `persistFinanceData()` wraps `saveFinanceData()`.
- **Query layer** (`src/hooks/useFinance.ts`): TanStack Query with `staleTime: Infinity`, `initialData` from localStorage. All mutations use a generic `useFinanceMutation` that does optimistic update → persist → rollback on error.
- **Query keys** (`src/lib/query-keys.ts`): Single key `['finance']`.

The clean separation between pure business logic (finance-store.ts) and persistence (storage.ts) makes the migration path straightforward — we replace the persistence layer, not the business logic.

## Affected Areas

- `src/lib/storage.ts` — Replace localStorage with API calls (or keep as offline fallback)
- `src/hooks/useFinance.ts` — Change `queryFn` from localStorage read to API fetch; change `mutationFn` from localStorage write to API call
- `src/lib/finance-store.ts` — `persistFinanceData()` needs to call API instead of `saveFinanceData()`; pure transform functions stay as-is for optimistic updates
- `src/lib/query-keys.ts` — Expand keys for per-resource queries (accounts, transactions, categories)
- `src/types/finance.ts` — Add `userId` to types or keep it server-side only
- `vite.config.ts` — Add dev proxy to backend
- `package.json` — New dependencies, new scripts for server
- New files: server entry, API routes, DB schema, auth config, drizzle config

## Key Technical Decisions

### 1. Project Structure

| Approach | Description | Pros | Cons | Effort |
|----------|-------------|------|------|--------|
| **A. Same package, `server/` directory** | Single package.json, server code in `server/`, frontend in `src/` | Simple, shared types, no workspace config | Scripts get complex, single tsconfig tricky | Low |
| **B. Monorepo with workspaces** | `packages/web`, `packages/api`, `packages/shared` | Clean separation, independent deploys, scalable | Overhead for a personal project, turborepo/workspace config | Medium-High |
| **C. Same package with `@hono/vite-dev-server`** | Use Hono's Vite plugin to serve both | Single dev command, integrated DX | Couples server to Vite, less flexible for deployment | Low-Medium |

**Recommendation: Approach A** — Same package with a `server/` directory. This is a personal finance app, not a team project. Keep it simple. Structure:

```
server/
  index.ts          # Hono app entry
  routes/
    auth.ts         # Auth routes
    accounts.ts     # CRUD for accounts
    transactions.ts # CRUD for transactions  
    categories.ts   # CRUD for custom categories
  db/
    schema.ts       # Drizzle schema
    index.ts        # DB connection
    migrate.ts      # Migration runner
  middleware/
    auth.ts         # Auth middleware
  drizzle.config.ts
src/                # Existing frontend (unchanged structure)
```

Use `tsx` or `@hono/node-server` to run the backend, and Vite's proxy for dev.

### 2. Authentication Library

| Approach | Description | Pros | Cons | Effort |
|----------|-------------|------|------|--------|
| **A. Auth.js (`@hono/auth-js` + `@auth/core`)** | Official Auth.js adapter for Hono | Well-known, many providers, established ecosystem | Credentials provider is second-class citizen, complex config, session handling quirks | Medium |
| **B. Better Auth** | Framework-agnostic auth library, native Hono support | Built-in email/password, sessions, email verification, password reset out of the box. Native Hono integration (no adapter needed — uses standard Request/Response). Drizzle adapter included. Active development, growing ecosystem (2025-2026 standard). | Newer library, smaller community | Low-Medium |
| **C. Roll your own (JWT + bcrypt)** | Custom auth middleware | Full control, minimal dependencies | Security footgun, reinventing the wheel | High risk |

**Recommendation: Approach B (Better Auth)** — Here's why:

1. **Better Auth integrates with Hono natively** — no adapter package needed. Hono uses Web Standard Request/Response, which Better Auth consumes directly.
2. **Built-in Credentials auth** — email/password is a first-class citizen, not a "we don't recommend this" afterthought like in Auth.js.
3. **Drizzle adapter included** — `better-auth` ships with `@better-auth/drizzle` or has built-in Drizzle support.
4. **Includes session management, password hashing (bcrypt), email verification, password reset** — all out of the box.
5. **2025-2026 ecosystem winner** — Lucia Auth deprecated, Auth.js is complex for simple credential flows, Better Auth fills the gap.

Packages: `better-auth` (single package, includes server + client).

### 3. Database Schema Design

Using Drizzle ORM with Neon serverless PostgreSQL.

**Packages**: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit` (dev)

```
Tables:
  user (managed by Better Auth)
    id          text PK
    name        text
    email       text UNIQUE
    emailVerified boolean
    image       text?
    createdAt   timestamp
    updatedAt   timestamp

  session (managed by Better Auth)
    id          text PK
    expiresAt   timestamp
    token       text UNIQUE
    userId      text FK -> user.id
    ...

  account (auth accounts — managed by Better Auth, for OAuth providers)
    id          text PK
    userId      text FK -> user.id
    provider    text
    ...

  finance_account (our domain)
    id          uuid PK DEFAULT gen_random_uuid()
    userId      text FK -> user.id ON DELETE CASCADE
    name        text NOT NULL
    currency    text NOT NULL  -- 'USD' | 'VES' | 'EUR' | 'COP' | 'MXN'
    initialBalance  numeric(12,2) NOT NULL DEFAULT 0
    createdAt   timestamp DEFAULT now()

  transaction
    id          uuid PK DEFAULT gen_random_uuid()
    userId      text FK -> user.id ON DELETE CASCADE
    accountId   uuid FK -> finance_account.id ON DELETE CASCADE
    type        text NOT NULL  -- 'income' | 'expense'
    amount      numeric(12,2) NOT NULL
    description text NOT NULL DEFAULT ''
    category    text NOT NULL
    date        timestamp NOT NULL
    createdAt   timestamp DEFAULT now()

  custom_category
    id          uuid PK DEFAULT gen_random_uuid()
    userId      text FK -> user.id ON DELETE CASCADE
    name        text NOT NULL
    type        text NOT NULL  -- 'income' | 'expense'
    color       text NOT NULL
    createdAt   timestamp DEFAULT now()
```

Key decisions:
- Better Auth manages `user`, `session`, and `account` (OAuth) tables — we do NOT define them manually. Better Auth generates the schema.
- Our domain tables use `userId` FK for data isolation.
- Use `numeric(12,2)` for money (NOT float).
- Use `uuid` for our domain IDs (PostgreSQL native), `text` for Better Auth IDs.
- Name our accounts table `finance_account` to avoid collision with Better Auth's `account` table.
- `ON DELETE CASCADE` on userId — delete user = delete all their data.

### 4. API Design

RESTful JSON API under `/api/` prefix:

```
POST   /api/auth/*           -- Better Auth handles all auth routes
GET    /api/accounts          -- List user's accounts
POST   /api/accounts          -- Create account
PUT    /api/accounts/:id      -- Update account
DELETE /api/accounts/:id      -- Delete account (+ cascades transactions)
GET    /api/transactions      -- List user's transactions (with filters: accountId, month, type)
POST   /api/transactions      -- Create transaction
PUT    /api/transactions/:id  -- Update transaction
DELETE /api/transactions/:id  -- Delete transaction
GET    /api/categories        -- List user's custom categories
POST   /api/categories        -- Create custom category
GET    /api/finance           -- Bulk fetch all data (for initial load / migration)
POST   /api/finance/import    -- Bulk import from localStorage (migration endpoint)
```

All non-auth routes require authentication (middleware). Every query scoped by `userId` from session.

### 5. Migration Strategy (localStorage to Server)

**Phase approach:**

1. **First login flow**: After user registers/logs in, check if localStorage has data.
2. **Offer import**: Show a "we found existing data, import it?" dialog.
3. **Bulk import**: POST to `/api/finance/import` with the full `FinanceData` blob.
4. **Server assigns userId**: Server adds the authenticated user's ID to every record.
5. **Clear localStorage**: After successful import, clear the localStorage data.
6. **Fallback**: If not logged in, app can still work in localStorage-only mode (offline/guest mode).

### 6. Frontend Hook Refactoring

The current `useFinanceMutation` pattern is well-structured for this transition:

**Current flow**: optimistic update cache → persist to localStorage → rollback on error  
**New flow**: optimistic update cache → POST to API → rollback on error

Changes needed:
- `financeQueryOptions.queryFn`: `fetch('/api/finance')` instead of `loadFinanceData()`
- `mutationFn` in `useFinanceMutation`: API calls instead of `persistFinanceData()`
- Granular mutations: Instead of saving the entire blob, each mutation (create account, add transaction) calls its specific API endpoint.
- `staleTime`: Change from `Infinity` to something reasonable (e.g., 5 minutes) or use invalidation.
- Add auth state hook: `useSession()` from Better Auth's React client.
- Conditional logic: If not authenticated, fall back to localStorage (guest mode).

### 7. Dev Environment Setup

**Vite proxy** in `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    }
  }
}
```

**Scripts** in `package.json`:
```json
{
  "dev": "concurrently \"vite\" \"tsx watch server/index.ts\"",
  "dev:web": "vite",
  "dev:server": "tsx watch server/index.ts",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

**New dev dependencies**: `tsx`, `concurrently`, `drizzle-kit`, `dotenv`  
**New dependencies**: `hono`, `@hono/node-server`, `better-auth`, `drizzle-orm`, `@neondatabase/serverless`

### 8. Deployment Considerations

| Target | Approach | Notes |
|--------|----------|-------|
| **Vercel** | Frontend: Vite static build. Backend: Vercel Functions or Edge Functions with Hono adapter | Neon is Vercel's DB partner — great integration |
| **Cloudflare Workers** | Backend: Hono on Workers (native). Frontend: Cloudflare Pages | Neon serverless driver works on Workers |
| **Standalone Node** | `@hono/node-server`, serve static frontend from dist/ | Simple VPS deployment, Railway, Fly.io |

**Recommendation**: Start with standalone Node (`@hono/node-server`) for simplicity. Structure the code so it can be deployed to Vercel/Cloudflare later without rewriting.

### 9. Session Management

Better Auth handles this. Default: **database sessions** (stored in the `session` table). This is more secure than JWT for a finance app:
- Sessions can be revoked server-side
- No token size bloat
- Session data stays on the server

Better Auth's client SDK provides `useSession()` hook for React.

### 10. TypeScript Configuration

Need a separate `tsconfig.server.json` for the server code:
- Target: `ES2022` or `ESNext`
- Module: `NodeNext`
- Separate from the frontend's `tsconfig.app.json`

The root `tsconfig.json` already uses project references — add the server config as another reference.

## Approaches Summary

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Project structure | Same package, `server/` dir | Simplicity for personal project |
| Auth library | Better Auth | Native Hono support, built-in credentials, Drizzle adapter |
| Database | Neon + Drizzle ORM | Serverless PostgreSQL, type-safe ORM, great migrations |
| API style | REST under `/api/` | Simple, well-understood, matches CRUD operations |
| Sessions | Database sessions (Better Auth default) | Revocable, secure for finance data |
| Dev setup | Vite proxy + concurrently | Two processes, simple and reliable |
| Deployment | Start with Node, design for portability | Hono runs anywhere |

## Risks

1. **Better Auth maturity** — Newer library than Auth.js. Mitigated by: active development, growing adoption, and the fact that Auth.js Credentials provider is poorly supported anyway.
2. **Data migration complexity** — localStorage import needs careful handling of ID mapping (client-generated UUIDs to server UUIDs, or keep client UUIDs). Recommendation: keep the same UUIDs during import since they're already `crypto.randomUUID()` which are valid PostgreSQL UUIDs.
3. **Two-process dev setup** — `concurrently` running Vite + tsx. Minor DX friction but well-understood pattern.
4. **Money precision** — Current types use `number` (floating point). Database will use `numeric(12,2)`. Need to handle serialization carefully (string or number in JSON responses). Consider using string representation for amounts in API responses to avoid floating point issues.
5. **Offline/guest mode complexity** — Supporting both localStorage (guest) and API (authenticated) paths adds conditional logic throughout the hooks layer. Consider: do we even need guest mode, or just require login?
6. **CORS in production** — If frontend and backend are on different origins, need proper CORS config. Hono has built-in CORS middleware.

## Open Questions for Proposal Phase

1. **Guest mode**: Should the app work without login (localStorage only) or require authentication? This significantly impacts the hooks layer complexity.
2. **User settings**: Should `miplatita-theme` and `miplatita-hide-amounts` move to the database too, or stay in localStorage as device-specific preferences?
3. **Email verification**: Required before using the app, or allow immediate use after registration?
4. **Password reset flow**: Email-based? This requires an email provider (Resend, SendGrid, etc.).

## Ready for Proposal

Yes. The technical landscape is well-understood:
- **Stack**: Hono + Better Auth + Drizzle ORM + Neon PostgreSQL
- **Structure**: Same package with `server/` directory
- **Migration path**: Clear separation in current code makes it feasible
- **Main decision needed**: Whether to support guest/offline mode or require login

The orchestrator should ask the user about the open questions (especially guest mode and email verification) before proceeding to the proposal phase.
