import { eq, and, inArray } from 'drizzle-orm'
import { coupons } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const db = useDb()

  const conditions = [
    inArray(coupons.status, ['PENDING', 'ONGOING', 'WINNING', 'LOSING'] as any)
  ]

  if (session.role === 'PLAYER') {
    conditions.push(eq(coupons.playerId, session.userId))
  } else {
    const descendantIds = await getDescendantIds(session.userId)
    const filtered = descendantIds.filter(id => id !== session.userId)
    if (filtered.length > 0) {
      conditions.push(inArray(coupons.playerId, filtered))
    } else {
      return { data: [] }
    }
  }

  const data = await db.select()
    .from(coupons)
    .where(and(...conditions))
    .orderBy(coupons.createdAt)

  return { data }
})
