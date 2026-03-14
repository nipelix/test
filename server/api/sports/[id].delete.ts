import { eq } from 'drizzle-orm'
import { sports } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [deleted] = await db.delete(sports).where(eq(sports.id, id)).returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Sport not found' })
  }

  return { ok: true }
})
