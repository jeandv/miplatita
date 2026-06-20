---
change: backend-auth
phase: tasks
status: complete
created: 2026-06-19
depends_on: [spec, design]
---

# Tasks: Backend API + Authentication + Guest Mode

## Phase 1: Infrastructure

- [ ] **1.1 Install dependencies and add scripts** — Add runtime deps (`hono`, `@hono/node-server`, `better-auth`, `drizzle-orm`, `@neondatabase/serverless`) and dev deps (`tsx`, `concurrently`, `drizzle-kit`, `dotenv`) to `package.json`. Add `dev`, `dev:web`, `dev:server`, `db:generate`, `db:migrate`, `db:studio` scripts.
  - Files: `package.json`
  - Produces: Updated package.json with all deps and scripts
  - Depends on: none
  - Parallel: yes

- [ ] **1.2 Create server TypeScript config** — Create `tsconfig.server.json` targeting ES2022/NodeNext with `include: ["server"]`. Add server reference to root `tsconfig.json`.
  - Files: `tsconfig.server.json`, `tsconfig.json`
  - Produces: Server-side TS compilation config
  - Depends on: none
  - Parallel: yes

- [ ] **1.3 Create environment and gitignore setup** — Create `.env.example` with `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` placeholders. Add `.env` to `.gitignore`.
  - Files: `.env.example`, `.gitignore`
  - Produces: Env template and gitignore update
  - Depends on: none
  - Parallel: yes

- [ ] **1.4 Create Drizzle config and DB connection** — Create `drizzle.config.ts` at project root with Neon driver config. Create `server/db/index.ts` with Neon `@neondatabase/serverless` pool and `drizzle()` instance.
  - Files: `drizzle.config.ts`, `server/db/index.ts`
  - Produces: DB connection module and migration config
  - Depends on: 1.1
  - Parallel: no

- [ ] **1.5 Define Drizzle schema** — Create `server/db/schema.ts` with `financeAccount`, `transaction`, `customCategory` tables per design. Include indexes (`fa_user_idx`, `tx_user_idx`, `tx_account_idx`, `tx_date_idx`, `cc_user_idx`).
  - Files: `server/db/schema.ts`
  - Produces: Domain table definitions for Drizzle ORM
  - Depends on: 1.4
  - Parallel: no

- [ ] **1.6 Configure Vite dev proxy** — Add `/api` proxy to `http://localhost:3001` in `vite.config.ts` server config.
  - Files: `vite.config.ts`
  - Produces: Dev proxy for API requests
  - Depends on: none
  - Parallel: yes

## Phase 2: Backend Core

- [ ] **2.1 Configure Better Auth** — Create `server/auth.ts` with Better Auth instance: Drizzle adapter, email/password plugin enabled, no email verification, database sessions.
  - Files: `server/auth.ts`
  - Produces: Auth instance ready to mount on Hono
  - Depends on: 1.4, 1.5
  - Parallel: no

- [ ] **2.2 Create auth middleware** — Create `server/middleware/auth.ts` that verifies session via `auth.api.getSession()`, returns 401 if missing, sets `userId` and `session` on Hono context.
  - Files: `server/middleware/auth.ts`
  - Produces: Reusable auth middleware for protected routes
  - Depends on: 2.1
  - Parallel: no

- [ ] **2.3 Create Hono app entry point** — Create `server/index.ts`: instantiate Hono app, add CORS middleware on `/api/*`, mount Better Auth on `/api/auth/**`, apply auth middleware to remaining `/api/*` routes, mount route groups, start with `@hono/node-server` on port 3001.
  - Files: `server/index.ts`
  - Produces: Running backend server entry point
  - Depends on: 2.1, 2.2
  - Parallel: no

- [ ] **2.4 Account CRUD routes** — Create `server/routes/accounts.ts` with GET (list by userId), POST (create), PUT `:id` (update with ownership check, 404 if not owned), DELETE `:id` (with cascade).
  - Files: `server/routes/accounts.ts`
  - Produces: `/api/accounts` endpoints
  - Depends on: 2.2, 1.5
  - Parallel: yes (with 2.5, 2.6, 2.7)

- [ ] **2.5 Transaction CRUD routes** — Create `server/routes/transactions.ts` with GET (filterable by `accountId`, `month`, `type`, paginated with `limit`/`offset`), POST, PUT `:id`, DELETE `:id`. All scoped by userId.
  - Files: `server/routes/transactions.ts`
  - Produces: `/api/transactions` endpoints with filtering
  - Depends on: 2.2, 1.5
  - Parallel: yes (with 2.4, 2.6, 2.7)

- [ ] **2.6 Category routes** — Create `server/routes/categories.ts` with GET (list by userId) and POST (create).
  - Files: `server/routes/categories.ts`
  - Produces: `/api/categories` endpoints
  - Depends on: 2.2, 1.5
  - Parallel: yes (with 2.4, 2.5, 2.7)

- [ ] **2.7 Bulk fetch and import routes** — Create `server/routes/finance.ts` with GET `/api/finance` (bulk fetch all user data) and POST `/api/finance/import` (validate, assign userId, insert in DB transaction, return counts).
  - Files: `server/routes/finance.ts`
  - Produces: `/api/finance` and `/api/finance/import` endpoints
  - Depends on: 2.2, 1.5
  - Parallel: yes (with 2.4, 2.5, 2.6)

## Phase 3: Frontend Auth

- [ ] **3.1 Create Better Auth React client** — Create `src/lib/auth-client.ts` exporting `useSession`, `signIn`, `signUp`, `signOut` from `createAuthClient({ baseURL: '/api/auth' })`.
  - Files: `src/lib/auth-client.ts`
  - Produces: Auth client hooks and functions
  - Depends on: none
  - Parallel: yes

- [ ] **3.2 Create Login and Register components** — Create `src/components/auth/LoginForm.tsx` and `src/components/auth/RegisterForm.tsx` with email/password fields, validation (min 8 chars password), error display, using `signIn.email` and `signUp.email`.
  - Files: `src/components/auth/LoginForm.tsx`, `src/components/auth/RegisterForm.tsx`
  - Produces: Auth UI components
  - Depends on: 3.1
  - Parallel: yes

- [ ] **3.3 Create AuthProvider context** — Create `src/contexts/AuthProvider.tsx` that uses `useSession()` to detect auth state and provides the active `PersistenceStrategy` via context. Loading state shows spinner. Authenticated -> ApiPersistence. Guest -> LocalPersistence.
  - Files: `src/contexts/AuthProvider.tsx`
  - Produces: Auth-aware context provider wrapping the app
  - Depends on: 3.1, 4.1
  - Parallel: no

## Phase 4: Frontend Integration

- [ ] **4.1 Create PersistenceStrategy interface and implementations** — Create `src/lib/persistence.ts` with `PersistenceStrategy` interface. Implement `LocalPersistence` (wraps existing `storage.ts` functions) and `ApiPersistence` (wraps `fetch('/api/...')` calls). Create `src/lib/api.ts` as typed fetch wrapper with amount string-to-number parsing.
  - Files: `src/lib/persistence.ts`, `src/lib/api.ts`
  - Produces: Dual-mode persistence abstraction
  - Depends on: none
  - Parallel: yes

- [ ] **4.2 Expand query keys** — Update `src/lib/query-keys.ts` to per-resource keys: `financeKeys.accounts`, `financeKeys.transactions(filters?)`, `financeKeys.categories`.
  - Files: `src/lib/query-keys.ts`
  - Produces: Granular query keys for per-resource invalidation
  - Depends on: none
  - Parallel: yes

- [ ] **4.3 Update storage helpers** — Add `hasLocalData()` and `clearFinanceData()` functions to `src/lib/storage.ts`.
  - Files: `src/lib/storage.ts`
  - Produces: Helper functions for import flow detection and cleanup
  - Depends on: none
  - Parallel: yes

- [ ] **4.4 Refactor useFinance hooks** — Modify `src/hooks/useFinance.ts` to consume `PersistenceStrategy` from context. Replace direct `persistFinanceData()` calls with `strategy.createAccount()`, etc. Keep optimistic update logic using existing pure functions. Update `queryFn` to use strategy.
  - Files: `src/hooks/useFinance.ts`
  - Produces: Dual-mode hooks (guest localStorage / authenticated API)
  - Depends on: 4.1, 4.2, 3.3
  - Parallel: no

- [ ] **4.5 Create ImportDialog component** — Create `src/components/ImportDialog.tsx` that checks `hasLocalData()` after auth, shows import prompt, calls `strategy.importData()`, clears localStorage on success, invalidates queries.
  - Files: `src/components/ImportDialog.tsx`
  - Produces: Data migration UI flow
  - Depends on: 4.1, 4.3
  - Parallel: yes

- [ ] **4.6 Wire AuthProvider and auth UI into App** — Wrap app with `AuthProvider` in `src/main.tsx` or `src/App.tsx`. Add login/register navigation, logout button, and `ImportDialog` render point.
  - Files: `src/App.tsx`, `src/main.tsx`
  - Produces: Fully wired auth flow in the app shell
  - Depends on: 3.2, 3.3, 4.4, 4.5
  - Parallel: no

## Phase 5: Dev Environment

- [ ] **5.1 Install deps and verify dev setup** — Run `npm install`. Verify `npm run dev` starts both Vite and server concurrently. Verify Vite proxy forwards `/api` to `:3001`.
  - Files: none (verification only)
  - Produces: Working dual-process dev environment
  - Depends on: 1.1, 1.6, 2.3
  - Parallel: no

## Phase 6: Verification

- [ ] **6.1 Verify auth scenarios** — Test: register new user (spec 1.1), duplicate email returns 409 (spec 1.2), login with valid creds (spec 1.3), invalid creds returns 401 (spec 1.4), logout invalidates session (spec 1.5), session persists across refresh (spec 1.6).
  - Files: none (manual testing)
  - Produces: Auth flow validated against spec scenarios
  - Depends on: 5.1
  - Parallel: yes (with 6.2, 6.3)

- [ ] **6.2 Verify guest mode and data isolation** — Test: guest usage works via localStorage without auth (spec 2.1), authenticated CRUD scoped by userId (spec 4.1), unauthenticated requests return 401 (spec 4.2), cross-user access returns 404 (spec 5.1).
  - Files: none (manual testing)
  - Produces: Guest mode and isolation validated
  - Depends on: 5.1
  - Parallel: yes (with 6.1, 6.3)

- [ ] **6.3 Verify import and dual-mode hooks** — Test: import offered when localStorage has data (spec 3.1), successful import migrates data and clears localStorage (spec 3.2), declined import preserves localStorage (spec 3.3), authenticated mutations use API with optimistic updates (spec 6.1), guest mutations use localStorage (spec 6.2), transaction filtering works (spec 4.3).
  - Files: none (manual testing)
  - Produces: Import flow and dual-mode hooks validated
  - Depends on: 5.1
  - Parallel: yes (with 6.1, 6.2)
