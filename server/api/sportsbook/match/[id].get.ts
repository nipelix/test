import { eq } from 'drizzle-orm'
import { matches, leagues, sports } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [match] = await db.select({
    id: matches.id,
    homeTeam: matches.homeTeam,
    awayTeam: matches.awayTeam,
    leagueId: matches.leagueId,
    leagueName: leagues.name,
    sportId: matches.sportId,
    sportName: sports.name,
    status: matches.status,
    startTime: matches.startTime,
    scoreHome: matches.scoreHome,
    scoreAway: matches.scoreAway,
    minute: matches.minute,
    period: matches.period,
    isPopular: matches.isPopular
  })
    .from(matches)
    .leftJoin(leagues, eq(matches.leagueId, leagues.id))
    .leftJoin(sports, eq(matches.sportId, sports.id))
    .where(eq(matches.id, id))

  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  // Only allow active matches
  if (!['PREMATCH', 'LIVE'].includes(match.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Match is not active for betting' })
  }

  const isLive = match.status === 'LIVE'

  // Check live betting permission
  if (isLive) {
    const features = await resolveSetting('features', session.userId, session.role) as any
    if (features && !features.liveBettingAllowed) {
      throw createError({ statusCode: 403, statusMessage: 'Live betting is not allowed' })
    }
  }

  const oddsResult = await calculateMatchOdds(id, session.userId, session.role)

  const filteredMarkets = []
  for (const market of oddsResult.markets) {
    if (market.status !== 'OPEN') continue
    const filteredSelections = []
    for (const sel of market.selections) {
      if (sel.status !== 'ACTIVE' || sel.finalOdds === null) continue
      const show = await shouldDisplayOdds(sel.finalOdds, isLive, session.userId, session.role)
      if (show) filteredSelections.push(sel)
    }
    if (filteredSelections.length > 0) {
      filteredMarkets.push({ ...market, selections: filteredSelections })
    }
  }

  return { ...match, markets: filteredMarkets }
})
