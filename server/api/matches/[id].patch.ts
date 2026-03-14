import { eq } from 'drizzle-orm'
import { matches } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateMatchSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.homeTeam !== undefined) updateData.homeTeam = body.homeTeam
  if (body.awayTeam !== undefined) updateData.awayTeam = body.awayTeam
  if (body.leagueId !== undefined) updateData.leagueId = body.leagueId
  if (body.sportId !== undefined) updateData.sportId = body.sportId
  if (body.startTime !== undefined) updateData.startTime = new Date(body.startTime)
  if (body.isPopular !== undefined) updateData.isPopular = body.isPopular
  if (body.externalId !== undefined) updateData.externalId = body.externalId

  if (Object.keys(updateData).length === 1) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const [updated] = await db.update(matches).set(updateData).where(eq(matches.id, id)).returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  return updated
})
