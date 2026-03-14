import { eq, and, or, isNull, inArray } from 'drizzle-orm'
import { oddsAdjustments, selections, markets, matches } from '../database/schema'

interface OddsAdjustment {
  scope: string
  adjustmentType: string
  value: string
  sportId: number | null
  marketTypeId: number | null
}

const SCOPE_ORDER = ['SYSTEM_GLOBAL', 'ROLE', 'BETTING_GROUP', 'MATCH', 'USER']

async function getAdjustments(
  scopeFilters: { scope: string; scopeRef: string }[],
  sportId?: number,
  marketTypeId?: number
): Promise<OddsAdjustment[]> {
  const db = useDb()

  const allAdjustments: OddsAdjustment[] = []

  for (const filter of scopeFilters) {
    const cacheKey = `odds_adj:${filter.scope}:${filter.scopeRef}`
    const rows = await cached<OddsAdjustment[]>(cacheKey, 60, async () => {
      return db.select({
        scope: oddsAdjustments.scope,
        adjustmentType: oddsAdjustments.adjustmentType,
        value: oddsAdjustments.value,
        sportId: oddsAdjustments.sportId,
        marketTypeId: oddsAdjustments.marketTypeId
      })
        .from(oddsAdjustments)
        .where(and(
          eq(oddsAdjustments.scope, filter.scope as any),
          eq(oddsAdjustments.scopeRef, filter.scopeRef),
          eq(oddsAdjustments.active, true)
        ))
    })
    allAdjustments.push(...rows)
  }

  // Filter by sport and market type (null = applies to all)
  return allAdjustments.filter(adj => {
    const sportMatch = !adj.sportId || adj.sportId === sportId
    const marketMatch = !adj.marketTypeId || adj.marketTypeId === marketTypeId
    return sportMatch && marketMatch
  })
}

function applyAdjustments(baseOdds: number, adjustments: OddsAdjustment[]): number {
  // Sort by scope priority
  const sorted = [...adjustments].sort((a, b) =>
    SCOPE_ORDER.indexOf(a.scope) - SCOPE_ORDER.indexOf(b.scope)
  )

  let finalOdds = baseOdds

  for (const adj of sorted) {
    const value = parseFloat(adj.value)
    if (adj.adjustmentType === 'FIXED') {
      finalOdds += value
    } else if (adj.adjustmentType === 'PERCENTAGE') {
      finalOdds += baseOdds * (value / 100)
    }
  }

  // Minimum 1.01, max 2 decimal places, prevent negative
  finalOdds = Math.max(1.01, finalOdds)
  finalOdds = Math.round(finalOdds * 100) / 100
  return finalOdds
}

export async function calculateFinalOdds(
  selectionId: number,
  userId?: number,
  userRole?: string,
  context?: { sportId?: number; marketTypeId?: number; matchId?: number; bettingGroupId?: number }
): Promise<number | null> {
  const cacheKey = `odds:final:${selectionId}:${userId || 'anon'}`
  return cached(cacheKey, 30, async () => {
    const db = useDb()

    // Get selection with its base odds
    const [sel] = await db.select().from(selections).where(eq(selections.id, selectionId))
    if (!sel || sel.status !== 'ACTIVE') return null

    const baseOdds = parseFloat(sel.baseOdds)

    // Build scope filters
    const scopeFilters: { scope: string; scopeRef: string }[] = [
      { scope: 'SYSTEM_GLOBAL', scopeRef: 'GLOBAL' }
    ]
    if (userRole) scopeFilters.push({ scope: 'ROLE', scopeRef: userRole })
    if (context?.bettingGroupId) scopeFilters.push({ scope: 'BETTING_GROUP', scopeRef: String(context.bettingGroupId) })
    if (context?.matchId) scopeFilters.push({ scope: 'MATCH', scopeRef: String(context.matchId) })
    if (userId) scopeFilters.push({ scope: 'USER', scopeRef: String(userId) })

    const adjustments = await getAdjustments(scopeFilters, context?.sportId, context?.marketTypeId)
    return applyAdjustments(baseOdds, adjustments)
  })
}

export interface MatchOddsResult {
  matchId: number
  markets: {
    marketId: number
    name: string
    line: string | null
    status: string
    selections: {
      selectionId: number
      name: string
      label: string
      baseOdds: number
      finalOdds: number | null
      status: string
    }[]
  }[]
}

export async function calculateMatchOdds(
  matchId: number,
  userId?: number,
  userRole?: string
): Promise<MatchOddsResult> {
  const db = useDb()

  // Get match for sport context
  const [match] = await db.select({
    id: matches.id,
    sportId: matches.sportId
  }).from(matches).where(eq(matches.id, matchId))

  if (!match) {
    return { matchId, markets: [] }
  }

  // Get all markets for this match
  const matchMarkets = await db.select()
    .from(markets)
    .where(eq(markets.matchId, matchId))

  if (matchMarkets.length === 0) {
    return { matchId, markets: [] }
  }

  const marketIds = matchMarkets.map(m => m.id)
  const marketSelections = await db.select()
    .from(selections)
    .where(inArray(selections.marketId, marketIds))
    .orderBy(selections.sortOrder)

  // Calculate odds for each selection
  const result: MatchOddsResult = { matchId, markets: [] }

  for (const market of matchMarkets) {
    const mSelections = marketSelections.filter(s => s.marketId === market.id)
    const selectionsWithOdds = []

    for (const sel of mSelections) {
      const finalOdds = await calculateFinalOdds(sel.id, userId, userRole, {
        sportId: match.sportId,
        marketTypeId: market.marketTypeId,
        matchId
      })

      selectionsWithOdds.push({
        selectionId: sel.id,
        name: sel.name,
        label: sel.label,
        baseOdds: parseFloat(sel.baseOdds),
        finalOdds,
        status: sel.status
      })
    }

    result.markets.push({
      marketId: market.id,
      name: market.name,
      line: market.line,
      status: market.status,
      selections: selectionsWithOdds
    })
  }

  return result
}

export async function shouldDisplayOdds(
  finalOdds: number,
  isLive: boolean,
  userId?: number,
  userRole?: string
): Promise<boolean> {
  const displayFilter = await resolveSetting('display_filter', userId, userRole) as any

  if (!displayFilter) return true

  if (displayFilter.fullCloseMode) return false

  const minDisplay = isLive ? displayFilter.liveMinDisplayOdds : displayFilter.normalMinDisplayOdds
  if (finalOdds < minDisplay) {
    return !displayFilter.hideMode
  }

  return true
}
