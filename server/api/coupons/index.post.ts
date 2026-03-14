import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { z } from 'zod'

const placeCouponSchema = z.object({
  selections: z.array(z.object({
    selectionId: z.number().int().positive()
  })).min(1),
  stake: z.number().positive(),
  type: z.enum(['SINGLE', 'COMBINATION', 'SYSTEM']),
  systemBetConfig: z.any().optional(),
  couponName: z.string().max(200).optional()
})

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const body = await readValidatedBody(event, placeCouponSchema.parse)

  // Find dealer (parent) for this player
  const db = useDb()

  const [user] = await db.select({ parentId: users.parentId }).from(users).where(eq(users.id, session.userId))
  if (!user || !user.parentId) {
    throw createError({ statusCode: 400, statusMessage: 'Player must have a parent dealer' })
  }

  const ipAddress = getRequestHeader(event, 'x-forwarded-for') || getRequestHeader(event, 'x-real-ip') || '0.0.0.0'

  const coupon = await createCoupon(
    body,
    session.userId,
    session.role,
    user.parentId,
    ipAddress
  )

  setResponseStatus(event, 201)
  return coupon
})
