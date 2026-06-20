import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { customCategory } from '../db/schema'
import type { AppEnv } from '../types'

export const categoryRoutes = new Hono<AppEnv>()

categoryRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const categories = await db.select().from(customCategory).where(eq(customCategory.userId, userId)).orderBy(customCategory.createdAt)
  return c.json(categories)
})

categoryRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const [created] = await db.insert(customCategory).values({
    userId,
    name: body.name,
    type: body.type,
    color: body.color,
  }).returning()
  return c.json(created, 201)
})
