import { eq, sql } from 'drizzle-orm'
import { providers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const active = query.active as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50))
  const offset = (page - 1) * limit

  const db = useDb()
  const conditions = []

  if (active !== undefined) {
    conditions.push(eq(providers.active, active === 'true'))
  }

  const where = conditions.length > 0 ? conditions[0] : undefined

  const [data, countResult] = await Promise.all([
    db.select().from(providers).where(where).limit(limit).offset(offset).orderBy(providers.name),
    db.select({ count: sql<number>`count(*)::int` }).from(providers).where(where)
  ])

  return { data, total: countResult[0]?.count || 0, page, limit }
})
