export interface MatchUpdate {
  matchId: number
  homeScore?: number
  awayScore?: number
  minute?: number
  status?: string
}

export interface OddsChange {
  matchId: number
  selectionId: number
  marketId: number
  oldOdds: number
  newOdds: number
}

export interface BalanceUpdate {
  userId: number
  newBalance: string
}

export interface CouponUpdate {
  couponId: number
  status: string
  payout?: string
}

export interface ServerToClientEvents {
  'session:expired': (reason: string) => void
  'connection:ack': (data: { userId: number; connectedAt: string }) => void
  'match:update': (data: MatchUpdate) => void
  'match:status': (data: { matchId: number; status: string }) => void
  'odds:change': (data: OddsChange) => void
  'balance:update': (data: BalanceUpdate) => void
  'coupon:update': (data: CouponUpdate) => void
}

export interface ClientToServerEvents {
  'subscribe:matches': (matchIds: number[]) => void
  'unsubscribe:matches': (matchIds: number[]) => void
}

export interface SocketData {
  userId: number
  role: string
  sessionId: string
}
