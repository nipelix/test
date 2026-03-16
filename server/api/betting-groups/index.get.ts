import { eq, and, sql } from 'drizzle-orm'
import { bettingGroups, sports } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const active = query.active as string | undefined
  const sportId = query.sportId as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50))
  const offset = (page - 1) * limit

  const db = useDb()
  const conditions = []

  if (active !== undefined) conditions.push(eq(bettingGroups.active, active === 'true'))
  if (sportId) conditions.push(eq(bettingGroups.sportId, sportId))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, countResult] = await Promise.all([
    db.select({
      id: bettingGroups.id,
      name: bettingGroups.name,
      sportId: bettingGroups.sportId,
      sportSlug: sports.slug,
      active: bettingGroups.active,
      sortOrder: bettingGroups.sortOrder,
      createdAt: bettingGroups.createdAt,
      updatedAt: bettingGroups.updatedAt
    })
      .from(bettingGroups)
      .leftJoin(sports, eq(bettingGroups.sportId, sports.id))
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(bettingGroups.sortOrder),
    db.select({ count: sql<number>`count(*)::int` }).from(bettingGroups).where(where)
  ])

  return { data, total: countResult[0]?.count || 0, page, limit }
})
