import { eq } from 'drizzle-orm'
import { coupons, couponSelections } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id))
  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Coupon not found' })
  }

  // Check access
  if (session.role === 'PLAYER') {
    if (coupon.playerId !== session.userId) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }
  } else {
    await requireTreeAccess(event, coupon.playerId)
  }

  const selections = await db.select()
    .from(couponSelections)
    .where(eq(couponSelections.couponId, id))

  return { ...coupon, selections }
})
