import { eq } from 'drizzle-orm'
import { coupons } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'DEALER'])
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const db = useDb()
  await db.delete(coupons).where(eq(coupons.id, id))
  return { success: true }
})
