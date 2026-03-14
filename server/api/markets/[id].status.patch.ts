import { eq } from 'drizzle-orm'
import { markets } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateMarketStatusSchema.parse)
  const db = useDb()

  const [updated] = await db.update(markets)
    .set({ status: body.status as any, updatedAt: new Date() })
    .where(eq(markets.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Market not found' })
  }

  return updated
})
