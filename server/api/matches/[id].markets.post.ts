import { eq } from 'drizzle-orm'
import { matches, markets } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, createMarketSchema.parse)
  const db = useDb()

  // Verify match exists
  const [match] = await db.select({ id: matches.id }).from(matches).where(eq(matches.id, id))
  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  const [market] = await db.insert(markets).values({
    matchId: id,
    marketTypeId: body.marketTypeId,
    name: body.name,
    line: body.line ? String(body.line) : null
  }).returning()

  setResponseStatus(event, 201)
  return market
})
