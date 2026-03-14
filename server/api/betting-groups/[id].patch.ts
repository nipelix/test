import { eq } from 'drizzle-orm'
import { bettingGroups } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateBettingGroupSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.sportId !== undefined) updateData.sportId = body.sportId
  if (body.active !== undefined) updateData.active = body.active
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder

  if (Object.keys(updateData).length === 1) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const [updated] = await db.update(bettingGroups).set(updateData).where(eq(bettingGroups.id, id)).returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Betting group not found' })
  }

  return updated
})
