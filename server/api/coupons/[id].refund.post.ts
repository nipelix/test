import { eq } from 'drizzle-orm'
import { coupons } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id))
  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Coupon not found' })
  }

  if (coupon.status === 'REFUNDED' || coupon.status === 'CANCELLED') {
    throw createError({ statusCode: 400, statusMessage: 'Coupon is already refunded or cancelled' })
  }

  const playerWallet = await getWalletByUserId(coupon.playerId)
  const dealerWallet = await getWalletByUserId(coupon.dealerId)

  if (!playerWallet || !dealerWallet) {
    throw createError({ statusCode: 500, statusMessage: 'Wallet not found for refund' })
  }

  // Refund player
  await executeTransaction({
    type: 'REFUND',
    walletId: playerWallet.id,
    direction: 'CREDIT',
    amount: parseFloat(coupon.stake),
    idempotencyKey: `refund:${coupon.id}:player`,
    referenceType: 'COUPON',
    referenceId: coupon.id,
    description: `Refund - Coupon ${coupon.betSlipNo}`,
    createdBy: session.userId
  })

  // Return dealer credit
  const creditDeduction = parseFloat(coupon.creditDeduction || '0')
  if (creditDeduction > 0) {
    await executeTransaction({
      type: 'CREDIT_RETURN',
      walletId: dealerWallet.id,
      direction: 'CREDIT',
      amount: creditDeduction,
      idempotencyKey: `refund:${coupon.id}:dealer`,
      referenceType: 'COUPON',
      referenceId: coupon.id,
      description: `Credit return for refunded coupon ${coupon.betSlipNo}`,
      createdBy: session.userId
    })
  }

  const [updated] = await db.update(coupons)
    .set({
      status: 'REFUNDED' as any,
      updatedAt: new Date()
    })
    .where(eq(coupons.id, id))
    .returning()

  return updated
})
