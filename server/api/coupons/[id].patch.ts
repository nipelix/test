import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { coupons } from '~~/server/database/schema'

const schema = z.object({
  status: z.enum(['WON', 'LOST', 'CANCELLED', 'REFUNDED']).optional()
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'DEALER'])
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readValidatedBody(event, schema.parse)
  const db = useDb()

  const [updated] = await db.update(coupons)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(coupons.id, id))
    .returning()

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Coupon not found' })
  return updated
})
