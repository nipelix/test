import { eq, and, sql, gte, lte } from 'drizzle-orm'
import { matches, leagues, sports } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const status = query.status as string | undefined
  const sportId = query.sportId as string | undefined
  const leagueId = query.leagueId as string | undefined
  const fromDate = query.fromDate as string | undefined
  const toDate = query.toDate as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const offset = (page - 1) * limit

  const db = useDb()
  const conditions = []

  if (status) conditions.push(eq(matches.status, status as any))
  if (sportId) conditions.push(eq(matches.sportId, Number(sportId)))
  if (leagueId) conditions.push(eq(matches.leagueId, Number(leagueId)))
  if (fromDate) conditions.push(gte(matches.startTime, new Date(fromDate)))
  if (toDate) conditions.push(lte(matches.startTime, new Date(toDate)))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, countResult] = await Promise.all([
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
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(matches.startTime),
    db.select({ count: sql<number>`count(*)::int` }).from(matches).where(where)
  ])

  return { data, total: countResult[0]?.count || 0, page, limit }
})
