import { eq } from 'drizzle-orm'
import { matches } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateMatchScoreSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = {
    scoreHome: body.scoreHome,
    scoreAway: body.scoreAway,
    updatedAt: new Date()
  }
  if (body.minute !== undefined) updateData.minute = body.minute
  if (body.period !== undefined) updateData.period = body.period

  const [updated] = await db.update(matches)
    .set(updateData)
    .where(eq(matches.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  return updated
})
