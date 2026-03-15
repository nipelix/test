import { z } from 'zod'

const schema = z.object({ leagueId: z.number().int().positive() })

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'DEALER'])
  const feed = getRouterParam(event, 'feed')
  if (feed !== 'live' && feed !== 'line') throw createError({ statusCode: 400, statusMessage: 'Invalid feed' })
  const body = await readValidatedBody(event, schema.parse)
  return { success: true, feed, leagueId: body.leagueId }
})
