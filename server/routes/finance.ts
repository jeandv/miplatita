import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { financeAccount, transaction, customCategory } from '../db/schema.js'
import type { AppEnv } from '../types.js'

export const financeRoutes = new Hono<AppEnv>()

financeRoutes.get('/', async (c) => {
  const userId = c.get('userId')

  const [accounts, transactions, categories] = await Promise.all([
    db.select().from(financeAccount).where(eq(financeAccount.userId, userId)),
    db.select().from(transaction).where(eq(transaction.userId, userId)),
    db.select().from(customCategory).where(eq(customCategory.userId, userId)),
  ])

  return c.json({ accounts, transactions, customCategories: categories })
})

financeRoutes.post('/import', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()

  const { accounts = [], transactions: txs = [], customCategories = [] } = body

  // neon-http driver doesn't support traditional transactions.
  // Insert sequentially: accounts first (transactions reference them via FK),
  // then transactions, then categories.

  let accountCount = 0
  let txCount = 0
  let categoryCount = 0

  if (accounts.length > 0) {
    const accountValues = accounts.map((a: any) => ({
      id: a.id,
      userId,
      name: a.name,
      currency: a.currency,
      initialBalance: String(a.initialBalance),
      createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
    }))
    await db.insert(financeAccount).values(accountValues)
    accountCount = accounts.length
  }

  if (txs.length > 0) {
    const txValues = txs.map((t: any) => ({
      id: t.id,
      userId,
      accountId: t.accountId,
      type: t.type,
      amount: String(t.amount),
      description: t.description || '',
      category: t.category,
      date: new Date(t.date),
      createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
    }))
    await db.insert(transaction).values(txValues)
    txCount = txs.length
  }

  if (customCategories.length > 0) {
    const catValues = customCategories.map((cat: any) => ({
      id: cat.id,
      userId,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
    }))
    await db.insert(customCategory).values(catValues)
    categoryCount = customCategories.length
  }

  return c.json({
    imported: {
      accounts: accountCount,
      transactions: txCount,
      categories: categoryCount,
    },
  })
})
