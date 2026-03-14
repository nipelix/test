export type CouponStatus = 'ongoing' | 'winning' | 'losing' | 'won' | 'lost' | 'refunded' | 'cancelled' | 'deleted'

export interface CouponSelection {
  id: number
  matchId: number
  homeTeam: string
  awayTeam: string
  leagueName: string
  marketName: string
  selectionName: string
  odds: number
  status: 'pending' | 'won' | 'lost' | 'void'
  score?: string
}

export interface Coupon {
  id: number
  betSlipNo: string
  status: CouponStatus
  agent: string
  subAgent: string
  player: string
  totalStake: number
  potentialPayout: number
  totalOdds: number
  credit: number
  totalMatches: number
  settledMatches: number
  couponName: string
  userIp: string
  createdAt: string
  type: 'single' | 'combination'
  selections: CouponSelection[]
}

export const mockCoupons: Coupon[] = [
  {
    id: 1,
    betSlipNo: 'BSN-000001',
    status: 'ongoing',
    agent: 'agent01',
    subAgent: 'subdealer01',
    player: 'player01',
    totalStake: 100,
    potentialPayout: 450,
    totalOdds: 4.50,
    credit: 100,
    totalMatches: 3,
    settledMatches: 1,
    couponName: 'Weekend Special',
    userIp: '192.168.1.10',
    createdAt: '2025-06-15T10:30:00Z',
    type: 'combination',
    selections: [
      { id: 1, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Match Result', selectionName: 'Home', odds: 1.45, status: 'won', score: '2-1' },
      { id: 2, matchId: 1002, homeTeam: 'Man City', awayTeam: 'Liverpool', leagueName: 'Premier League', marketName: 'Match Result', selectionName: 'Draw', odds: 3.40, status: 'pending' },
      { id: 3, matchId: 1003, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', leagueName: 'La Liga', marketName: 'Over/Under 2.5', selectionName: 'Over 2.5', odds: 1.90, status: 'pending' }
    ]
  },
  {
    id: 2,
    betSlipNo: 'BSN-000002',
    status: 'winning',
    agent: 'agent01',
    subAgent: 'subdealer01',
    player: 'player02',
    totalStake: 50,
    potentialPayout: 175,
    totalOdds: 3.50,
    credit: 50,
    totalMatches: 2,
    settledMatches: 2,
    couponName: '',
    userIp: '192.168.1.11',
    createdAt: '2025-06-15T09:15:00Z',
    type: 'combination',
    selections: [
      { id: 4, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Match Result', selectionName: 'Home', odds: 1.45, status: 'won', score: '2-1' },
      { id: 5, matchId: 1006, homeTeam: 'PSG', awayTeam: 'Marseille', leagueName: 'Ligue 1', marketName: 'Match Result', selectionName: 'Home', odds: 1.30, status: 'won', score: '3-0' }
    ]
  },
  {
    id: 3,
    betSlipNo: 'BSN-000003',
    status: 'losing',
    agent: 'agent01',
    subAgent: 'subdealer01',
    player: 'player03',
    totalStake: 200,
    potentialPayout: 600,
    totalOdds: 3.00,
    credit: 200,
    totalMatches: 2,
    settledMatches: 1,
    couponName: 'Big Bet',
    userIp: '192.168.1.12',
    createdAt: '2025-06-14T20:00:00Z',
    type: 'combination',
    selections: [
      { id: 6, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Match Result', selectionName: 'Away', odds: 6.00, status: 'lost', score: '2-1' },
      { id: 7, matchId: 1003, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', leagueName: 'La Liga', marketName: 'Match Result', selectionName: 'Home', odds: 2.30, status: 'pending' }
    ]
  },
  {
    id: 4,
    betSlipNo: 'BSN-000004',
    status: 'won',
    agent: 'agent01',
    subAgent: 'subdealer01',
    player: 'player04',
    totalStake: 75,
    potentialPayout: 262.50,
    totalOdds: 3.50,
    credit: 75,
    totalMatches: 1,
    settledMatches: 1,
    couponName: '',
    userIp: '192.168.1.13',
    createdAt: '2025-06-13T16:00:00Z',
    type: 'single',
    selections: [
      { id: 8, matchId: 1006, homeTeam: 'PSG', awayTeam: 'Marseille', leagueName: 'Ligue 1', marketName: 'Correct Score', selectionName: '3-0', odds: 3.50, status: 'won', score: '3-0' }
    ]
  },
  {
    id: 5,
    betSlipNo: 'BSN-000005',
    status: 'lost',
    agent: 'agent01',
    subAgent: '',
    player: 'player05',
    totalStake: 150,
    potentialPayout: 525,
    totalOdds: 3.50,
    credit: 150,
    totalMatches: 3,
    settledMatches: 3,
    couponName: 'Triple Threat',
    userIp: '192.168.1.14',
    createdAt: '2025-06-12T14:30:00Z',
    type: 'combination',
    selections: [
      { id: 9, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Over/Under 2.5', selectionName: 'Under 2.5', odds: 2.10, status: 'lost', score: '2-1' },
      { id: 10, matchId: 1002, homeTeam: 'Man City', awayTeam: 'Liverpool', leagueName: 'Premier League', marketName: 'Match Result', selectionName: 'Home', odds: 2.10, status: 'won', score: '1-0' },
      { id: 11, matchId: 1006, homeTeam: 'PSG', awayTeam: 'Marseille', leagueName: 'Ligue 1', marketName: 'Both Teams Score', selectionName: 'Yes', odds: 2.20, status: 'lost', score: '3-0' }
    ]
  },
  {
    id: 6,
    betSlipNo: 'BSN-000006',
    status: 'refunded',
    agent: 'agent01',
    subAgent: 'subdealer01',
    player: 'player06',
    totalStake: 300,
    potentialPayout: 900,
    totalOdds: 3.00,
    credit: 300,
    totalMatches: 1,
    settledMatches: 0,
    couponName: '',
    userIp: '192.168.1.15',
    createdAt: '2025-06-11T12:00:00Z',
    type: 'single',
    selections: [
      { id: 12, matchId: 1007, homeTeam: 'Beşiktaş', awayTeam: 'Trabzonspor', leagueName: 'Süper Lig', marketName: 'Match Result', selectionName: 'Home', odds: 3.00, status: 'void' }
    ]
  },
  {
    id: 7,
    betSlipNo: 'BSN-000007',
    status: 'cancelled',
    agent: 'agent01',
    subAgent: '',
    player: 'player07',
    totalStake: 25,
    potentialPayout: 62.50,
    totalOdds: 2.50,
    credit: 25,
    totalMatches: 1,
    settledMatches: 0,
    couponName: '',
    userIp: '192.168.1.16',
    createdAt: '2025-06-10T18:45:00Z',
    type: 'single',
    selections: [
      { id: 13, matchId: 1005, homeTeam: 'AC Milan', awayTeam: 'Inter Milan', leagueName: 'Serie A', marketName: 'Match Result', selectionName: 'Draw', odds: 2.50, status: 'void' }
    ]
  },
  {
    id: 8,
    betSlipNo: 'BSN-000008',
    status: 'ongoing',
    agent: 'agent01',
    subAgent: 'subdealer01',
    player: 'player08',
    totalStake: 500,
    potentialPayout: 2500,
    totalOdds: 5.00,
    credit: 500,
    totalMatches: 4,
    settledMatches: 2,
    couponName: 'Euro Night',
    userIp: '192.168.1.17',
    createdAt: '2025-06-15T11:00:00Z',
    type: 'combination',
    selections: [
      { id: 14, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Match Result', selectionName: 'Home', odds: 1.45, status: 'won', score: '2-1' },
      { id: 15, matchId: 1002, homeTeam: 'Man City', awayTeam: 'Liverpool', leagueName: 'Premier League', marketName: 'Over/Under 2.5', selectionName: 'Over 2.5', odds: 1.80, status: 'pending' },
      { id: 16, matchId: 1003, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', leagueName: 'La Liga', marketName: 'Match Result', selectionName: 'Home', odds: 2.30, status: 'pending' },
      { id: 17, matchId: 1004, homeTeam: 'Bayern', awayTeam: 'Dortmund', leagueName: 'Bundesliga', marketName: 'Match Result', selectionName: 'Home', odds: 1.55, status: 'won' }
    ]
  },
  {
    id: 9,
    betSlipNo: 'BSN-000009',
    status: 'ongoing',
    agent: 'agent01',
    subAgent: '',
    player: 'player09',
    totalStake: 80,
    potentialPayout: 168,
    totalOdds: 2.10,
    credit: 80,
    totalMatches: 1,
    settledMatches: 0,
    couponName: '',
    userIp: '192.168.1.18',
    createdAt: '2025-06-15T12:15:00Z',
    type: 'single',
    selections: [
      { id: 18, matchId: 1009, homeTeam: 'R. Nadal', awayTeam: 'N. Djokovic', leagueName: 'ATP Tour', marketName: 'Match Winner', selectionName: 'R. Nadal', odds: 2.10, status: 'pending' }
    ]
  },
  {
    id: 10,
    betSlipNo: 'BSN-000010',
    status: 'won',
    agent: 'agent01',
    subAgent: 'subdealer01',
    player: 'player10',
    totalStake: 120,
    potentialPayout: 348,
    totalOdds: 2.90,
    credit: 120,
    totalMatches: 2,
    settledMatches: 2,
    couponName: 'Lucky Draw',
    userIp: '192.168.1.19',
    createdAt: '2025-06-14T15:30:00Z',
    type: 'combination',
    selections: [
      { id: 19, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Over/Under 2.5', selectionName: 'Over 2.5', odds: 1.75, status: 'won', score: '2-1' },
      { id: 20, matchId: 1006, homeTeam: 'PSG', awayTeam: 'Marseille', leagueName: 'Ligue 1', marketName: 'Over/Under 2.5', selectionName: 'Over 2.5', odds: 1.65, status: 'won', score: '3-0' }
    ]
  },
  {
    id: 11, betSlipNo: 'BSN-000011', status: 'ongoing', agent: 'agent01', subAgent: '', player: 'player01', totalStake: 60, potentialPayout: 150, totalOdds: 2.50, credit: 60, totalMatches: 2, settledMatches: 0, couponName: '', userIp: '192.168.1.10', createdAt: '2025-06-15T13:00:00Z', type: 'combination', selections: [
      { id: 21, matchId: 1004, homeTeam: 'Bayern', awayTeam: 'Dortmund', leagueName: 'Bundesliga', marketName: 'Match Result', selectionName: 'Home', odds: 1.55, status: 'pending' },
      { id: 22, matchId: 1005, homeTeam: 'AC Milan', awayTeam: 'Inter Milan', leagueName: 'Serie A', marketName: 'Match Result', selectionName: 'Home', odds: 2.70, status: 'pending' }
    ]
  },
  {
    id: 12, betSlipNo: 'BSN-000012', status: 'lost', agent: 'agent01', subAgent: 'subdealer01', player: 'player02', totalStake: 40, potentialPayout: 120, totalOdds: 3.00, credit: 40, totalMatches: 1, settledMatches: 1, couponName: '', userIp: '192.168.1.11', createdAt: '2025-06-13T10:00:00Z', type: 'single', selections: [
      { id: 23, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Match Result', selectionName: 'Draw', odds: 3.00, status: 'lost', score: '2-1' }
    ]
  },
  {
    id: 13, betSlipNo: 'BSN-000013', status: 'winning', agent: 'agent01', subAgent: '', player: 'player04', totalStake: 200, potentialPayout: 740, totalOdds: 3.70, credit: 200, totalMatches: 3, settledMatches: 2, couponName: 'High Roller', userIp: '192.168.1.13', createdAt: '2025-06-15T08:00:00Z', type: 'combination', selections: [
      { id: 24, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Match Result', selectionName: 'Home', odds: 1.45, status: 'won', score: '2-1' },
      { id: 25, matchId: 1006, homeTeam: 'PSG', awayTeam: 'Marseille', leagueName: 'Ligue 1', marketName: 'Match Result', selectionName: 'Home', odds: 1.30, status: 'won', score: '3-0' },
      { id: 26, matchId: 1003, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', leagueName: 'La Liga', marketName: 'Both Teams Score', selectionName: 'Yes', odds: 1.95, status: 'pending' }
    ]
  },
  {
    id: 14, betSlipNo: 'BSN-000014', status: 'ongoing', agent: 'agent01', subAgent: 'subdealer01', player: 'player05', totalStake: 30, potentialPayout: 63, totalOdds: 2.10, credit: 30, totalMatches: 1, settledMatches: 0, couponName: '', userIp: '192.168.1.14', createdAt: '2025-06-15T14:00:00Z', type: 'single', selections: [
      { id: 27, matchId: 1002, homeTeam: 'Man City', awayTeam: 'Liverpool', leagueName: 'Premier League', marketName: 'Match Result', selectionName: 'Home', odds: 2.10, status: 'pending' }
    ]
  },
  {
    id: 15, betSlipNo: 'BSN-000015', status: 'lost', agent: 'agent01', subAgent: '', player: 'player08', totalStake: 250, potentialPayout: 750, totalOdds: 3.00, credit: 250, totalMatches: 2, settledMatches: 2, couponName: 'Night Bet', userIp: '192.168.1.17', createdAt: '2025-06-12T22:00:00Z', type: 'combination', selections: [
      { id: 28, matchId: 1001, homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', leagueName: 'Süper Lig', marketName: 'Over/Under 2.5', selectionName: 'Under 2.5', odds: 2.10, status: 'lost', score: '2-1' },
      { id: 29, matchId: 1006, homeTeam: 'PSG', awayTeam: 'Marseille', leagueName: 'Ligue 1', marketName: 'Both Teams Score', selectionName: 'Yes', odds: 2.20, status: 'lost', score: '3-0' }
    ]
  }
]

export const activeCoupons = mockCoupons.filter(c => c.status === 'ongoing' || c.status === 'winning' || c.status === 'losing')
export const trashedCoupons = mockCoupons.filter(c => c.status === 'cancelled')
