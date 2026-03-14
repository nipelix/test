import { eq, and, sql, inArray } from 'drizzle-orm'
import { coupons } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const db = useDb()

  const conditions = []

  if (session.role === 'PLAYER') {
    conditions.push(eq(coupons.playerId, session.userId))
  } else {
    const descendantIds = await getDescendantIds(session.userId)
    const filtered = descendantIds.filter(id => id !== session.userId)
    if (filtered.length > 0) {
      conditions.push(inArray(coupons.playerId, filtered))
    } else {
      return {
        total: 0,
        pending: 0,
        won: 0,
        lost: 0,
        cancelled: 0,
        totalStake: 0,
        totalPayout: 0
      }
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [stats] = await db.select({
    total: sql<number>`count(*)::int`,
    pending: sql<number>`count(*) filter (where ${coupons.status} in ('PENDING', 'ONGOING', 'WINNING', 'LOSING'))::int`,
    won: sql<number>`count(*) filter (where ${coupons.status} = 'WON')::int`,
    lost: sql<number>`count(*) filter (where ${coupons.status} = 'LOST')::int`,
    cancelled: sql<number>`count(*) filter (where ${coupons.status} in ('CANCELLED', 'REFUNDED'))::int`,
    totalStake: sql<number>`coalesce(sum(${coupons.stake}::numeric), 0)`,
    totalPayout: sql<number>`coalesce(sum(${coupons.actualPayout}::numeric), 0)`
  })
    .from(coupons)
    .where(where)

  return stats
})
