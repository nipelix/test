import { eq, and, sql, desc, asc, inArray } from 'drizzle-orm'
import { coupons, users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  const query = getQuery(event)
  const status = query.status as string | undefined
  const playerId = query.playerId ? Number(query.playerId) : undefined
  const sortByParam = query.sortBy as string | undefined
  const sortDirectionParam = query.sortDirection as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const offset = (page - 1) * limit

  // Sort whitelist (multi-sort: comma-separated)
  const sortWhitelist: Record<string, any> = {
    createdAt: coupons.createdAt,
    stake: coupons.stake,
    totalOdds: coupons.totalOdds,
    potentialPayout: coupons.potentialPayout,
    status: coupons.status,
    betSlipNo: coupons.betSlipNo
  }
  const sortKeys = (sortByParam ?? 'createdAt').split(',')
  const sortDirs = (sortDirectionParam ?? 'desc').split(',')
  const orderClauses = sortKeys
    .map((key, i) => {
      const col = sortWhitelist[key.trim()]
      if (!col) return null
      const dir = sortDirs[i]?.trim() === 'asc' ? asc : desc
      return dir(col)
    })
    .filter(Boolean)
  if (orderClauses.length === 0) orderClauses.push(desc(coupons.createdAt))

  const db = useDb()
  const conditions = []

  if (session.role === 'PLAYER') {
    // Players only see their own coupons
    conditions.push(eq(coupons.playerId, session.userId))
  } else {
    // Dealers/Admins see coupons of their subtree
    if (playerId) {
      await requireTreeAccess(event, playerId)
      conditions.push(eq(coupons.playerId, playerId))
    } else {
      const descendantIds = await getDescendantIds(session.userId)
      const filtered = descendantIds.filter(id => id !== session.userId)
      if (filtered.length > 0) {
        conditions.push(inArray(coupons.playerId, filtered))
      } else {
        return { data: [], total: 0, page, limit }
      }
    }
  }

  if (status) conditions.push(eq(coupons.status, status as any))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, countResult] = await Promise.all([
    db.select().from(coupons).where(where).limit(limit).offset(offset).orderBy(...orderClauses),
    db.select({ count: sql<number>`count(*)::int` }).from(coupons).where(where)
  ])

  return { data, total: countResult[0]?.count || 0, page, limit }
})
