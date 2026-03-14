import { oddsAdjustments } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const body = await readValidatedBody(event, createOddsAdjustmentSchema.parse)
  const db = useDb()

  const [adjustment] = await db.insert(oddsAdjustments).values({
    scope: body.scope as any,
    scopeRef: body.scopeRef,
    sportId: body.sportId || null,
    marketTypeId: body.marketTypeId || null,
    adjustmentType: body.adjustmentType as any,
    value: String(body.value),
    active: body.active
  }).returning()

  // Invalidate odds cache
  await invalidateCache('odds:*')

  setResponseStatus(event, 201)
  return adjustment
})
