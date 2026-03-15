import { eq, and, sql, inArray } from 'drizzle-orm'
import { matches, leagues, sports, markets, selections } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  const query = getQuery(event)
  const sportId = query.sportId as string | undefined
  const leagueId = query.leagueId as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 20))
  const offset = (page - 1) * limit

  const db = useDb()
  const conditions = [eq(matches.status, 'PREMATCH' as any)]

  if (sportId) conditions.push(eq(matches.sportId, Number(sportId)))
  if (leagueId) conditions.push(eq(matches.leagueId, Number(leagueId)))

  const where = and(...conditions)

  const [matchData, countResult] = await Promise.all([
    db.select({
      id: matches.id,
      homeTeam: matches.homeTeam,
      awayTeam: matches.awayTeam,
      leagueId: matches.leagueId,
      leagueName: leagues.name,
      sportId: matches.sportId,
      sportName: sports.name,
      status: matches.status,
      startTime: matches.startTime,
      isPopular: matches.isPopular
    })
      .from(matches)
      .leftJoin(leagues, eq(matches.leagueId, leagues.id))
      .leftJoin(sports, eq(matches.sportId, sports.id))
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(matches.startTime),
    db.select({ count: sql<number>`count(*)::int` }).from(matches).where(where)
  ])

  // Calculate odds for each match
  const data = []
  for (const match of matchData) {
    const oddsResult = await calculateMatchOdds(match.id, session.userId, session.role)

    // Filter by display rules
    const filteredMarkets = []
    const isLive = false
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

    data.push({ ...match, markets: filteredMarkets })
  }

  return { data, total: countResult[0]?.count || 0, page, limit }
})
