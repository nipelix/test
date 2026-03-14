import { eq } from 'drizzle-orm'
import { selections } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateSelectionSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.label !== undefined) updateData.label = body.label
  if (body.baseOdds !== undefined) updateData.baseOdds = String(body.baseOdds)
  if (body.status !== undefined) updateData.status = body.status
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder

  if (Object.keys(updateData).length === 1) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const [updated] = await db.update(selections).set(updateData).where(eq(selections.id, id)).returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Selection not found' })
  }

  return updated
})
