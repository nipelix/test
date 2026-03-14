import { eq } from 'drizzle-orm'
import { coupons } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER'])
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id))
  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Coupon not found' })
  }

  // Check tree access to player
  await requireTreeAccess(event, coupon.playerId)

  if (!['PENDING', 'ONGOING', 'WINNING', 'LOSING'].includes(coupon.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon is not in a cancellable status' })
  }

  // Perform cancellation (bypasses time and live checks)
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
