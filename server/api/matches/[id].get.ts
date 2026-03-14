import { eq, inArray } from 'drizzle-orm'
import { matches, markets, selections, leagues, sports, marketTypes } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

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
    isPopular: matches.isPopular,
    externalId: matches.externalId,
    createdAt: matches.createdAt,
    updatedAt: matches.updatedAt
  })
    .from(matches)
    .leftJoin(leagues, eq(matches.leagueId, leagues.id))
    .leftJoin(sports, eq(matches.sportId, sports.id))
    .where(eq(matches.id, id))

  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  // Fetch markets with selections
  const matchMarkets = await db.select({
    id: markets.id,
    matchId: markets.matchId,
    marketTypeId: markets.marketTypeId,
    marketTypeName: marketTypes.name,
    name: markets.name,
    line: markets.line,
    status: markets.status,
    createdAt: markets.createdAt,
    updatedAt: markets.updatedAt
  })
    .from(markets)
    .leftJoin(marketTypes, eq(markets.marketTypeId, marketTypes.id))
    .where(eq(markets.matchId, id))

  const marketIds = matchMarkets.map(m => m.id)
  let matchSelections: any[] = []
  if (marketIds.length > 0) {
    matchSelections = await db.select()
      .from(selections)
      .where(inArray(selections.marketId, marketIds))
      .orderBy(selections.sortOrder)
  }

  // Group selections by marketId
  const selectionsByMarket: Record<string, any[]> = {}
  for (const sel of matchSelections) {
    if (!selectionsByMarket[sel.marketId]) selectionsByMarket[sel.marketId] = []
    selectionsByMarket[sel.marketId]!.push(sel)
  }

  const marketsWithSelections = matchMarkets.map(m => ({
    ...m,
    selections: selectionsByMarket[m.id] || []
  }))

  return { ...match, markets: marketsWithSelections }
})
