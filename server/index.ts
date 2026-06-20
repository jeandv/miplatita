import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { auth } from './auth'
import { authMiddleware } from './middleware/auth'
import { accountRoutes } from './routes/accounts'
import { transactionRoutes } from './routes/transactions'
import { categoryRoutes } from './routes/categories'
import { financeRoutes } from './routes/finance'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

app.use('/api/*', cors({
  origin: 'http://localhost:5173',
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

const port = 3001
console.log(`Server running on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
