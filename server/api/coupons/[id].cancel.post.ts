import { eq } from 'drizzle-orm'
import { coupons } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id))
  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Coupon not found' })
  }

  // Only player who owns the coupon can cancel
  if (coupon.playerId !== session.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Only the coupon owner can cancel' })
  }

  const cancelCheck = await canCancelCoupon(id, session.userId, session.role)
  if (!cancelCheck.canCancel) {
    throw createError({ statusCode: 400, statusMessage: cancelCheck.reason || 'Cannot cancel this coupon' })
  }

  // Perform cancellation
  const playerWallet = await getWalletByUserId(coupon.playerId)
  const dealerWallet = await getWalletByUserId(coupon.dealerId)

  if (!playerWallet || !dealerWallet) {
    throw createError({ statusCode: 500, statusMessage: 'Wallet not found for refund' })
  }

  await cancelBetTransaction(
    playerWallet.id,
    dealerWallet.id,
    parseFloat(coupon.stake),
    parseFloat(coupon.creditDeduction || '0'),
    coupon.id,
    session.userId
  )

  const [updated] = await db.update(coupons)
    .set({
      status: 'CANCELLED' as any,
      cancelledAt: new Date(),
      cancelledBy: session.userId,
      updatedAt: new Date()
    })
    .where(eq(coupons.id, id))
    .returning()

  return updated
})
