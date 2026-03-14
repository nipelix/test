import { eq } from 'drizzle-orm'
import { oddsAdjustments } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateOddsAdjustmentSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.scope !== undefined) updateData.scope = body.scope
  if (body.scopeRef !== undefined) updateData.scopeRef = body.scopeRef
  if (body.sportId !== undefined) updateData.sportId = body.sportId
  if (body.marketTypeId !== undefined) updateData.marketTypeId = body.marketTypeId
  if (body.adjustmentType !== undefined) updateData.adjustmentType = body.adjustmentType
  if (body.value !== undefined) updateData.value = String(body.value)
  if (body.active !== undefined) updateData.active = body.active

  if (Object.keys(updateData).length === 1) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const [updated] = await db.update(oddsAdjustments).set(updateData).where(eq(oddsAdjustments.id, id)).returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Odds adjustment not found' })
  }

  await invalidateCache('odds:*')
  return updated
})
