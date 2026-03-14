export interface BettingRules {
  maxBetAmount: number
  maxPotentialPayout: number
  minStake: number
  bettingMinSelections: number
  bettingMaxSelections: number
  bettingMaxOdds: number
  bettingMinOdds: number
  lineBettingMinOdds: number
  lineBettingMaxOdds: number
  liveBettingMinOdds: number
  liveBettingMaxOdds: number
  liveBettingDuration: number
  deleteMatchAfter: number
  blockCouponCancelationAfter: number
  extraCombination: boolean
  insurance: boolean
  liveBettingAllowed: boolean
  lineBettingAllowed: boolean
  systemBetsOfferAllowed: boolean
  casinoGamesOfferAllowed: boolean
  combineLiveAndLineAllowed: boolean
  allowSameEventSelections: boolean
  oddChange: boolean
  couponPreview: boolean
  lineBulkOdds: number
  liveBulkOdds: number
}

export const defaultBettingRules: BettingRules = {
  maxBetAmount: 5000,
  maxPotentialPayout: 50000,
  minStake: 1,
  bettingMinSelections: 1,
  bettingMaxSelections: 20,
  bettingMaxOdds: 500,
  bettingMinOdds: 1.01,
  lineBettingMinOdds: 1.01,
  lineBettingMaxOdds: 100,
  liveBettingMinOdds: 1.01,
  liveBettingMaxOdds: 50,
  liveBettingDuration: 30,
  deleteMatchAfter: 24,
  blockCouponCancelationAfter: 5,
  extraCombination: false,
  insurance: false,
  liveBettingAllowed: true,
  lineBettingAllowed: true,
  systemBetsOfferAllowed: false,
  casinoGamesOfferAllowed: true,
  combineLiveAndLineAllowed: true,
  allowSameEventSelections: false,
  oddChange: true,
  couponPreview: true,
  lineBulkOdds: 0,
  liveBulkOdds: 0
}

export interface BettingGroup {
  id: number
  name: string
  sportId: number
  sportName: string
  active: boolean
  marketsCount: number
}

export const mockBettingGroups: BettingGroup[] = [
  { id: 1, name: 'Main Markets', sportId: 1, sportName: 'Football', active: true, marketsCount: 12 },
  { id: 2, name: 'Goals Markets', sportId: 1, sportName: 'Football', active: true, marketsCount: 8 },
  { id: 3, name: 'Corner Markets', sportId: 1, sportName: 'Football', active: true, marketsCount: 4 },
  { id: 4, name: 'Card Markets', sportId: 1, sportName: 'Football', active: true, marketsCount: 3 },
  { id: 5, name: 'Basketball Main', sportId: 2, sportName: 'Basketball', active: true, marketsCount: 6 },
  { id: 6, name: 'Tennis Main', sportId: 3, sportName: 'Tennis', active: true, marketsCount: 5 },
  { id: 7, name: 'Volleyball Main', sportId: 4, sportName: 'Volleyball', active: true, marketsCount: 4 },
  { id: 8, name: 'Special Markets', sportId: 1, sportName: 'Football', active: false, marketsCount: 6 }
]

export interface Category {
  id: number
  name: string
  description: string
  active: boolean
  sortOrder: number
}

export const mockCategories: Category[] = [
  { id: 1, name: 'Football', description: 'Football betting markets', active: true, sortOrder: 1 },
  { id: 2, name: 'Basketball', description: 'Basketball betting markets', active: true, sortOrder: 2 },
  { id: 3, name: 'Tennis', description: 'Tennis betting markets', active: true, sortOrder: 3 },
  { id: 4, name: 'Volleyball', description: 'Volleyball betting markets', active: true, sortOrder: 4 },
  { id: 5, name: 'Ice Hockey', description: 'Ice Hockey betting markets', active: true, sortOrder: 5 },
  { id: 6, name: 'Handball', description: 'Handball betting markets', active: true, sortOrder: 6 },
  { id: 7, name: 'E-Sports', description: 'E-Sports betting markets', active: true, sortOrder: 7 },
  { id: 8, name: 'Casino Games', description: 'Casino game markets', active: true, sortOrder: 8 },
  { id: 9, name: 'Virtual Sports', description: 'Virtual sports markets', active: false, sortOrder: 9 },
  { id: 10, name: 'Special Bets', description: 'Special/novelty betting', active: false, sortOrder: 10 }
]
