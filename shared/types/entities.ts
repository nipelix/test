// ── Base entity ──
export interface BaseEntity {
  id: number
  createdAt?: string
  updatedAt?: string
}

// ── Sport ──
export interface Sport extends BaseEntity {
  name: string
  slug: string
  active: boolean
  sortOrder?: number
}

// ── Country ──
export interface Country extends BaseEntity {
  name: string
  code: string
  flag?: string
  active: boolean
}

// ── League ──
export interface League extends BaseEntity {
  name: string
  sportId: number
  countryId: number
  sportName?: string
  countryName?: string
  active: boolean
}

// ── Match ──
export interface Match extends BaseEntity {
  homeTeam: string
  awayTeam: string
  leagueId: number
  leagueName?: string
  sportId?: number
  status: string
  score?: string
  startTime: string
  feedType?: string
}

// ── Betting Group ──
export interface BettingGroup extends BaseEntity {
  name: string
  active: boolean
  sortOrder?: number
}

// ── Market Type ──
export interface MarketType extends BaseEntity {
  name: string
  period?: string
  sortOrder?: number
}

// ── Selection Template ──
export interface SelectionTemplate extends BaseEntity {
  name: string
  marketTypeId: number
  groupId?: number
  sortOrder?: number
  hashId?: string
}

// ── Credit Range ──
export interface CreditRange extends BaseEntity {
  minAmount: string
  maxAmount: string
  creditDeduction: string
  active: boolean
}

// ── Provider ──
export interface Provider extends BaseEntity {
  name: string
  slug: string
}

// ── User (list row) ──
export interface UserRow extends BaseEntity {
  username: string
  email: string
  role: string
  parentId: number | null
  status: string
  walletType: string
  balance: string | null
}

// ── Coupon ──
export interface CouponRow extends BaseEntity {
  betSlipNo: string
  playerId: number
  dealerId: number
  type: string
  status: string
  stake: string
  totalOdds: string
  potentialPayout: string
  actualPayout: string
  creditDeduction: string
  couponName: string | null
  hasLiveSelections: boolean
  ipAddress: string | null
  cancelledAt: string | null
  cancelledBy: number | null
  playerUsername?: string
  dealerUsername?: string
}

// ── Transaction ──
export interface TransactionRow extends BaseEntity {
  type: string
  amount: string
  balanceBefore?: string
  balanceAfter?: string
  description?: string
}

// ── Activity Log ──
export interface ActivityLog extends BaseEntity {
  userId: number
  username?: string
  action: string
  entityType?: string
  entityId?: number
  details?: any
  ipAddress?: string
}
