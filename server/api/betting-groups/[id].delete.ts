import { eq } from 'drizzle-orm'
import { bettingGroups } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [deleted] = await db.delete(bettingGroups).where(eq(bettingGroups.id, id)).returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Betting group not found' })
  }

  return { ok: true }
})
