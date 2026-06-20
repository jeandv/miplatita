import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { neon } from '@neondatabase/serverless'
import { auth } from './auth.js'
import { authMiddleware } from './middleware/auth.js'
import { accountRoutes } from './routes/accounts.js'
import { transactionRoutes } from './routes/transactions.js'
import { categoryRoutes } from './routes/categories.js'
import { financeRoutes } from './routes/finance.js'
import type { AppEnv } from './types.js'

const app = new Hono<AppEnv>()

const allowedOrigins = [
  'http://localhost:5173',
  process.env.BETTER_AUTH_URL ?? '',
].filter(Boolean)

app.use('/api/*', cors({
  origin: allowedOrigins,
  credentials: true,
}))

app.get('/api/health', (c) => {
  return c.json({
    ok: true,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'SET' : 'MISSING',
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'MISSING',
    },
  })
})

// Temporary one-shot migration endpoint. Guarded by BETTER_AUTH_SECRET.
// Idempotent (CREATE TABLE IF NOT EXISTS). Remove after running once.
app.get('/api/admin/migrate', async (c) => {
  const key = c.req.query('key')
  if (!key || key !== process.env.BETTER_AUTH_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const sql = neon(process.env.DATABASE_URL!)
  const statements = [
    `CREATE TABLE IF NOT EXISTS "user" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "email_verified" boolean DEFAULT false NOT NULL, "image" text, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL, CONSTRAINT "user_email_unique" UNIQUE("email"))`,
    `CREATE TABLE IF NOT EXISTS "session" ("id" text PRIMARY KEY NOT NULL, "expires_at" timestamp NOT NULL, "token" text NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL, "ip_address" text, "user_agent" text, "user_id" text NOT NULL, CONSTRAINT "session_token_unique" UNIQUE("token"))`,
    `CREATE TABLE IF NOT EXISTS "account" ("id" text PRIMARY KEY NOT NULL, "account_id" text NOT NULL, "provider_id" text NOT NULL, "user_id" text NOT NULL, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" timestamp, "refresh_token_expires_at" timestamp, "scope" text, "password" text, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "verification" ("id" text PRIMARY KEY NOT NULL, "identifier" text NOT NULL, "value" text NOT NULL, "expires_at" timestamp NOT NULL, "created_at" timestamp DEFAULT now(), "updated_at" timestamp DEFAULT now())`,
    `CREATE TABLE IF NOT EXISTS "finance_account" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" text NOT NULL, "name" text NOT NULL, "currency" text NOT NULL, "initial_balance" numeric(12,2) NOT NULL DEFAULT '0', "created_at" timestamp DEFAULT now())`,
    `CREATE TABLE IF NOT EXISTS "transaction" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" text NOT NULL, "account_id" uuid NOT NULL REFERENCES "finance_account"("id") ON DELETE CASCADE, "type" text NOT NULL, "amount" numeric(12,2) NOT NULL, "description" text NOT NULL DEFAULT '', "category" text NOT NULL, "date" timestamp NOT NULL, "created_at" timestamp DEFAULT now())`,
    `CREATE TABLE IF NOT EXISTS "custom_category" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" text NOT NULL, "name" text NOT NULL, "type" text NOT NULL, "color" text NOT NULL, "created_at" timestamp DEFAULT now())`,
    `DO $$ BEGIN ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `CREATE INDEX IF NOT EXISTS "fa_user_idx" ON "finance_account"("user_id")`,
    `CREATE INDEX IF NOT EXISTS "tx_user_idx" ON "transaction"("user_id")`,
    `CREATE INDEX IF NOT EXISTS "tx_account_idx" ON "transaction"("account_id")`,
    `CREATE INDEX IF NOT EXISTS "tx_date_idx" ON "transaction"("user_id", "date")`,
    `CREATE INDEX IF NOT EXISTS "cc_user_idx" ON "custom_category"("user_id")`,
  ]

  const results: string[] = []
  for (const stmt of statements) {
    try {
      await sql.query(stmt)
      results.push('OK: ' + stmt.slice(0, 50))
    } catch (e) {
      results.push('FAIL: ' + stmt.slice(0, 50) + ' -> ' + (e as Error).message)
    }
  }

  return c.json({ done: true, results })
})

app.on(['POST', 'GET'], '/api/auth/**', async (c) => {
  try {
    return await auth.handler(c.req.raw)
  } catch (e) {
    console.error('[auth error]', e)
    return c.json({ error: 'Internal auth error' }, 500)
  }
})

app.use('/api/*', authMiddleware)

app.route('/api/accounts', accountRoutes)
app.route('/api/transactions', transactionRoutes)
app.route('/api/categories', categoryRoutes)
app.route('/api/finance', financeRoutes)

export default app
