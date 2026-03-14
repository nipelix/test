import { eq } from 'drizzle-orm'
import { oddsAdjustments } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [deleted] = await db.delete(oddsAdjustments).where(eq(oddsAdjustments.id, id)).returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Odds adjustment not found' })
  }

  await invalidateCache('odds:*')
  return { ok: true }
})
