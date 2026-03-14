import { eq, and, inArray } from 'drizzle-orm'
import { selections, markets, matches, coupons, couponSelections, leagues } from '../database/schema'
import { randomBytes } from 'node:crypto'

interface CouponSelectionInput {
  selectionId: number
}

interface CouponInput {
  selections: CouponSelectionInput[]
  stake: number
  type: 'SINGLE' | 'COMBINATION' | 'SYSTEM'
  systemBetConfig?: any
  couponName?: string
}

interface ValidatedSelection {
  selectionId: number
  marketId: number
  matchId: number
  selectionName: string
  marketName: string
  homeTeam: string
  awayTeam: string
  leagueName: string | null
  finalOdds: number
  isLive: boolean
  matchScore: string | null
  sportId: number
  marketTypeId: number
}

function generateBetSlipNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(4).toString('hex').toUpperCase()
  return `BS-${timestamp}-${random}`
}

export async function validateCouponSelections(
  input: CouponInput,
  userId: number,
  userRole: string
): Promise<{ validatedSelections: ValidatedSelection[]; totalOdds: number; potentialPayout: number }> {
  const db = useDb()
  const settings = await resolveSettings(userId, userRole)
  const bettingLimits = settings.betting_limits as any
  const oddsLimits = settings.odds_limits as any
  const features = settings.features as any

  const selectionIds = input.selections.map(s => s.selectionId)

  // 1. Fetch all selections with market and match data
  const selRows = await db.select({
    selectionId: selections.id,
    selectionName: selections.name,
    selectionLabel: selections.label,
    selectionStatus: selections.status,
    baseOdds: selections.baseOdds,
    marketId: markets.id,
    marketName: markets.name,
    marketStatus: markets.status,
    marketTypeId: markets.marketTypeId,
    matchId: matches.id,
    homeTeam: matches.homeTeam,
    awayTeam: matches.awayTeam,
    matchStatus: matches.status,
    sportId: matches.sportId,
    leagueId: matches.leagueId,
    leagueName: leagues.name,
    scoreHome: matches.scoreHome,
    scoreAway: matches.scoreAway
  })
    .from(selections)
    .innerJoin(markets, eq(selections.marketId, markets.id))
    .innerJoin(matches, eq(markets.matchId, matches.id))
    .leftJoin(leagues, eq(matches.leagueId, leagues.id))
    .where(inArray(selections.id, selectionIds))

  if (selRows.length !== selectionIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'One or more selections not found' })
  }

  const validatedSelections: ValidatedSelection[] = []

  for (const row of selRows) {
    // Check 1: Selections must be ACTIVE
    if (row.selectionStatus !== 'ACTIVE') {
      throw createError({ statusCode: 400, statusMessage: `Selection "${row.selectionName}" is not active` })
    }

    // Check 1: Markets must be OPEN
    if (row.marketStatus !== 'OPEN') {
      throw createError({ statusCode: 400, statusMessage: `Market "${row.marketName}" is not open` })
    }

    // Check 1: Matches must be active (PREMATCH or LIVE)
    if (!['PREMATCH', 'LIVE'].includes(row.matchStatus)) {
      throw createError({ statusCode: 400, statusMessage: `Match "${row.homeTeam} vs ${row.awayTeam}" is not active` })
    }

    const isLive = row.matchStatus === 'LIVE'

    // Check 2: Calculate final odds
    const finalOdds = await calculateFinalOdds(row.selectionId, userId, userRole, {
      sportId: row.sportId,
      marketTypeId: row.marketTypeId,
      matchId: row.matchId
    })

    if (finalOdds === null) {
      throw createError({ statusCode: 400, statusMessage: `Could not calculate odds for "${row.selectionName}"` })
    }

    // Check 3: Display filter check
    const canDisplay = await shouldDisplayOdds(finalOdds, isLive, userId, userRole)
    if (!canDisplay) {
      throw createError({ statusCode: 400, statusMessage: `Odds for "${row.selectionName}" are not available` })
    }

    // Check 7: Min/max odds check
    const minOdds = isLive ? oddsLimits.liveMinOdds : oddsLimits.normalMinOdds
    const maxOdds = isLive ? oddsLimits.liveMaxOdds : oddsLimits.normalMaxOdds
    if (finalOdds < minOdds || finalOdds > maxOdds) {
      throw createError({ statusCode: 400, statusMessage: `Odds ${finalOdds} for "${row.selectionName}" are out of allowed range (${minOdds}-${maxOdds})` })
    }

    validatedSelections.push({
      selectionId: row.selectionId,
      marketId: row.marketId,
      matchId: row.matchId,
      selectionName: row.selectionName,
      marketName: row.marketName,
      homeTeam: row.homeTeam,
      awayTeam: row.awayTeam,
      leagueName: row.leagueName,
      finalOdds,
      isLive,
      matchScore: isLive ? `${row.scoreHome}-${row.scoreAway}` : null,
      sportId: row.sportId,
      marketTypeId: row.marketTypeId
    })
  }

  // Check 4: Same event check
  if (!features.allowSameEvent) {
    const matchIds = validatedSelections.map(s => s.matchId)
    const uniqueMatchIds = new Set(matchIds)
    if (uniqueMatchIds.size !== matchIds.length) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot place multiple selections from the same match' })
    }
  }

  // Check 5: Live+Normal mix check
  const hasLive = validatedSelections.some(s => s.isLive)
  const hasNormal = validatedSelections.some(s => !s.isLive)
  if (hasLive && hasNormal && !features.combineLiveAndLine) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot combine live and pre-match selections' })
  }

  // Check if live betting is allowed
  if (hasLive && !features.liveBettingAllowed) {
    throw createError({ statusCode: 400, statusMessage: 'Live betting is not allowed' })
  }

  // Check 6: Min/max selections
  if (validatedSelections.length < bettingLimits.minSelections) {
    throw createError({ statusCode: 400, statusMessage: `Minimum ${bettingLimits.minSelections} selection(s) required` })
  }
  if (validatedSelections.length > bettingLimits.maxSelections) {
    throw createError({ statusCode: 400, statusMessage: `Maximum ${bettingLimits.maxSelections} selections allowed` })
  }

  // Calculate total odds
  const totalOdds = validatedSelections.reduce((acc, s) => acc * s.finalOdds, 1)
  const roundedTotalOdds = Math.round(totalOdds * 100) / 100

  // Check 8: Total odds limit
  if (roundedTotalOdds > bettingLimits.maxTotalOdds) {
    throw createError({ statusCode: 400, statusMessage: `Total odds ${roundedTotalOdds} exceeds maximum ${bettingLimits.maxTotalOdds}` })
  }

  // Check 9: Stake min/max
  if (input.stake < bettingLimits.minStake) {
    throw createError({ statusCode: 400, statusMessage: `Minimum stake is ${bettingLimits.minStake}` })
  }
  if (input.stake > bettingLimits.maxBetAmount) {
    throw createError({ statusCode: 400, statusMessage: `Maximum bet amount is ${bettingLimits.maxBetAmount}` })
  }

  // Calculate potential payout
  const potentialPayout = Math.round(input.stake * roundedTotalOdds * 100) / 100

  // Check 10: Potential payout limit
  if (potentialPayout > bettingLimits.maxPotentialPayout) {
    throw createError({ statusCode: 400, statusMessage: `Potential payout ${potentialPayout} exceeds maximum ${bettingLimits.maxPotentialPayout}` })
  }

  return { validatedSelections, totalOdds: roundedTotalOdds, potentialPayout }
}

export async function createCoupon(
  input: CouponInput,
  playerId: number,
  playerRole: string,
  dealerId: number,
  ipAddress: string
): Promise<any> {
  const db = useDb()

  // Validate selections
  const { validatedSelections, totalOdds, potentialPayout } = await validateCouponSelections(
    input, playerId, playerRole
  )

  // Check 11: Balance check
  const playerWallet = await getWalletByUserId(playerId)
  if (!playerWallet) {
    throw createError({ statusCode: 400, statusMessage: 'Player wallet not found' })
  }
  if (parseFloat(playerWallet.balance) < input.stake) {
    throw createError({ statusCode: 400, statusMessage: 'Insufficient balance' })
  }

  // Calculate credit deduction for dealer
  const creditDeduction = await calculateCreditDeduction(input.stake)

  // Check dealer wallet has enough credit
  const dealerWallet = await getWalletByUserId(dealerId)
  if (!dealerWallet) {
    throw createError({ statusCode: 400, statusMessage: 'Dealer wallet not found' })
  }
  if (parseFloat(dealerWallet.balance) < creditDeduction) {
    throw createError({ statusCode: 400, statusMessage: 'Dealer has insufficient credit' })
  }

  const hasLive = validatedSelections.some(s => s.isLive)
  const betSlipNo = generateBetSlipNo()

  // Create coupon
  const [coupon] = await db.insert(coupons).values({
    betSlipNo,
    playerId,
    dealerId,
    type: input.type as any,
    status: 'PENDING',
    stake: String(input.stake),
    totalOdds: String(totalOdds),
    potentialPayout: String(potentialPayout),
    creditDeduction: String(creditDeduction),
    couponName: input.couponName || null,
    systemBetConfig: input.systemBetConfig || null,
    ipAddress,
    oddsSnapshotAt: new Date(),
    hasLiveSelections: hasLive
  }).returning()

  if (!coupon) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create coupon' })
  }

  // Create coupon selections
  for (const sel of validatedSelections) {
    await db.insert(couponSelections).values({
      couponId: coupon.id,
      matchId: sel.matchId,
      marketId: sel.marketId,
      selectionId: sel.selectionId,
      selectionName: sel.selectionName,
      marketName: sel.marketName,
      homeTeam: sel.homeTeam,
      awayTeam: sel.awayTeam,
      leagueName: sel.leagueName,
      snapshotOdds: String(sel.finalOdds),
      status: 'PENDING',
      isLive: sel.isLive,
      matchScore: sel.matchScore
    })
  }

  // Execute financial transactions
  await placeBetTransaction(
    playerWallet.id,
    dealerWallet.id,
    input.stake,
    creditDeduction,
    coupon.id,
    playerId
  )

  return coupon
}

export async function canCancelCoupon(couponId: number, userId: number, userRole: string): Promise<{ canCancel: boolean; reason?: string }> {
  const db = useDb()

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, couponId))
  if (!coupon) {
    return { canCancel: false, reason: 'Coupon not found' }
  }

  if (!['PENDING', 'ONGOING'].includes(coupon.status)) {
    return { canCancel: false, reason: 'Coupon is not in a cancellable status' }
  }

  // Check if coupon has live selections
  if (coupon.hasLiveSelections) {
    return { canCancel: false, reason: 'Cannot cancel coupons with live selections' }
  }

  // Check time limit
  const settings = await resolveSettings(userId, userRole)
  const timeSettings = settings.time_settings as any
  const cancelTimeMin = timeSettings.couponCancelTimeMin || 15

  const createdAt = new Date(coupon.createdAt).getTime()
  const now = Date.now()
  const diffMinutes = (now - createdAt) / (1000 * 60)

  if (diffMinutes > cancelTimeMin) {
    return { canCancel: false, reason: `Cancel time limit of ${cancelTimeMin} minutes exceeded` }
  }

  return { canCancel: true }
}
