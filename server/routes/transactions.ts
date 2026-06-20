import { Hono } from 'hono'
import { eq, and, gte, lt, desc, sql, type SQL } from 'drizzle-orm'
import { db } from '../db'
import { transaction } from '../db/schema'
import type { AppEnv } from '../types'

export const transactionRoutes = new Hono<AppEnv>()

transactionRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const accountId = c.req.query('accountId')
  const month = c.req.query('month')
  const type = c.req.query('type')
  const limit = Math.min(Math.max(Number(c.req.query('limit')) || 50, 1), 200)
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0)

  const conditions: SQL[] = [eq(transaction.userId, userId)]

  if (accountId) {
    conditions.push(eq(transaction.accountId, accountId))
  }

  if (month) {
    const startDate = new Date(`${month}-01T00:00:00.000Z`)
    const endDate = new Date(startDate)
    endDate.setUTCMonth(endDate.getUTCMonth() + 1)
    conditions.push(gte(transaction.date, startDate))
    conditions.push(lt(transaction.date, endDate))
  }

  if (type === 'income' || type === 'expense') {
    conditions.push(eq(transaction.type, type))
  }

  const where = and(...conditions)

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(where)
      .orderBy(desc(transaction.date), desc(transaction.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(transaction)
      .where(where),
  ])

  return c.json({ data, total })
})

transactionRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{
    accountId: string
    type: string
    amount: number | string
    description?: string
    category: string
    date: string
  }>()

  const [created] = await db
    .insert(transaction)
    .values({
      userId,
      accountId: body.accountId,
      type: body.type,
      amount: String(body.amount),
      description: body.description ?? '',
      category: body.category,
      date: new Date(body.date),
    })
    .returning()

  return c.json(created, 201)
})

transactionRoutes.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json<{
    accountId?: string
    type?: string
    amount?: number | string
    description?: string
    category?: string
    date?: string
  }>()

  const updates: Record<string, unknown> = {}
  if (body.accountId != null) updates.accountId = body.accountId
  if (body.type != null) updates.type = body.type
  if (body.amount != null) updates.amount = String(body.amount)
  if (body.description != null) updates.description = body.description
  if (body.category != null) updates.category = body.category
  if (body.date != null) updates.date = new Date(body.date)

  const [updated] = await db
    .update(transaction)
    .set(updates)
    .where(and(eq(transaction.id, id), eq(transaction.userId, userId)))
    .returning()

  if (!updated) {
    return c.json({ error: 'Transaction not found' }, 404)
  }

  return c.json(updated)
})

transactionRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const [deleted] = await db
    .delete(transaction)
    .where(and(eq(transaction.id, id), eq(transaction.userId, userId)))
    .returning()

  if (!deleted) {
    return c.json({ error: 'Transaction not found' }, 404)
  }

  return c.body(null, 204)
})
