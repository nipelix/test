import { eq } from 'drizzle-orm'
import { marketTypes } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const db = useDb()
  await db.delete(marketTypes).where(eq(marketTypes.id, id))
  return { success: true }
})
