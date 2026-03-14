import { eq, and, sql } from 'drizzle-orm'
import { oddsAdjustments } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const query = getQuery(event)
  const scope = query.scope as string | undefined
  const scopeRef = query.scopeRef as string | undefined
  const active = query.active as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50))
  const offset = (page - 1) * limit

  const db = useDb()
  const conditions = []

  if (scope) conditions.push(eq(oddsAdjustments.scope, scope as any))
  if (scopeRef) conditions.push(eq(oddsAdjustments.scopeRef, scopeRef))
  if (active !== undefined) conditions.push(eq(oddsAdjustments.active, active === 'true'))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, countResult] = await Promise.all([
    db.select().from(oddsAdjustments).where(where).limit(limit).offset(offset).orderBy(oddsAdjustments.scope, oddsAdjustments.createdAt),
    db.select({ count: sql<number>`count(*)::int` }).from(oddsAdjustments).where(where)
  ])

  return { data, total: countResult[0]?.count || 0, page, limit }
})
