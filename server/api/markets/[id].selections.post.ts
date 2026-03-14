import { eq } from 'drizzle-orm'
import { markets, selections } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, createSelectionSchema.parse)
  const db = useDb()

  // Verify market exists
  const [market] = await db.select({ id: markets.id }).from(markets).where(eq(markets.id, id))
  if (!market) {
    throw createError({ statusCode: 404, statusMessage: 'Market not found' })
  }

  const [selection] = await db.insert(selections).values({
    marketId: id,
    name: body.name,
    label: body.label,
    baseOdds: String(body.baseOdds),
    sortOrder: body.sortOrder
  }).returning()

  setResponseStatus(event, 201)
  return selection
})
