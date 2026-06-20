import { Hono } from 'hono'
import { cors } from 'hono/cors'
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
