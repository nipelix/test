import { matches } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const body = await readValidatedBody(event, createMatchSchema.parse)
  const db = useDb()

  const [match] = await db.insert(matches).values({
    homeTeam: body.homeTeam,
    awayTeam: body.awayTeam,
    leagueId: body.leagueId,
    sportId: body.sportId,
    startTime: new Date(body.startTime),
    isPopular: body.isPopular,
    externalId: body.externalId || null
  }).returning()

  setResponseStatus(event, 201)
  return match
})
