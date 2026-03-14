import { eq } from 'drizzle-orm'
import { markets } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateMarketSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.line !== undefined) updateData.line = body.line !== null ? String(body.line) : null

  if (Object.keys(updateData).length === 1) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const [updated] = await db.update(markets).set(updateData).where(eq(markets.id, id)).returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Market not found' })
  }

  return updated
})
