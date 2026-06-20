import { Hono } from 'hono'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { financeAccount } from '../db/schema.js'
import type { AppEnv } from '../types.js'

export const accountRoutes = new Hono<AppEnv>()

accountRoutes.get('/', async (c) => {
  const userId = c.get('userId')

  const accounts = await db
    .select()
    .from(financeAccount)
    .where(eq(financeAccount.userId, userId))
    .orderBy(asc(financeAccount.createdAt))

  return c.json(accounts)
})

accountRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{
    name: string
    currency: string
    initialBalance?: number | string
  }>()

  const [account] = await db
    .insert(financeAccount)
    .values({
      userId,
      name: body.name,
      currency: body.currency,
      initialBalance: body.initialBalance != null ? String(body.initialBalance) : '0',
    })
    .returning()

  return c.json(account, 201)
})

accountRoutes.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json<{
    name?: string
    currency?: string
    initialBalance?: number | string
  }>()

  const updates: Record<string, unknown> = {}
  if (body.name != null) updates.name = body.name
  if (body.currency != null) updates.currency = body.currency
  if (body.initialBalance != null) updates.initialBalance = String(body.initialBalance)

  const [updated] = await db
    .update(financeAccount)
    .set(updates)
    .where(and(eq(financeAccount.id, id), eq(financeAccount.userId, userId)))
    .returning()

  if (!updated) {
    return c.json({ error: 'Account not found' }, 404)
  }

  return c.json(updated)
})

accountRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const [deleted] = await db
    .delete(financeAccount)
    .where(and(eq(financeAccount.id, id), eq(financeAccount.userId, userId)))
    .returning()

  if (!deleted) {
    return c.json({ error: 'Account not found' }, 404)
  }

  return c.body(null, 204)
})
