import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth'
import { authMiddleware } from './middleware/auth'
import { accountRoutes } from './routes/accounts'
import { transactionRoutes } from './routes/transactions'
import { categoryRoutes } from './routes/categories'
import { financeRoutes } from './routes/finance'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

const allowedOrigins = [
  'http://localhost:5173',
  process.env.BETTER_AUTH_URL ?? '',
].filter(Boolean)

app.use('/api/*', cors({
  origin: allowedOrigins,
  credentials: true,
}))

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
