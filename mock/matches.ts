export type MatchStatus = 'live' | 'prematch' | 'finished' | 'cancelled' | 'postponed'

export interface MarketSelection {
  id: string
  name: string       // "1", "X", "2", "Over 2.5", "Under 2.5", "Yes", "No"
  label: string      // Display label for the button
  odds: number
  isLocked?: boolean
  isSelected?: boolean
}

export interface Market {
  id: string
  name: string       // "Match Result", "Over/Under 2.5", "Both Teams Score"
  selections: MarketSelection[]
}

export interface MatchOdds {
  home: number
  draw: number
  away: number
}

export interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  leagueId: number
  leagueName: string
  sportId: number
  sportName: string
  countryName: string
  countryFlag: string
  status: MatchStatus
  score?: { home: number, away: number }
  minute?: number
  period?: string    // "1H", "2H", "HT", "FT", etc.
  startTime: string
  odds: MatchOdds
  markets: Market[]
  marketsCount: number
  isPopular?: boolean
  corners?: { home: number, away: number }
  yellowCards?: { home: number, away: number }
  redCards?: { home: number, away: number }
}

function createFootballMarkets(homeOdds: number, drawOdds: number, awayOdds: number, overUnder: { over: number, under: number, line: string }, bts: { yes: number, no: number }, locked?: { ou?: boolean, bts?: boolean }): Market[] {
  // Double Chance odds from match result
  const dc1x = +(1 / (1/homeOdds + 1/drawOdds)).toFixed(2)
  const dc12 = +(1 / (1/homeOdds + 1/awayOdds)).toFixed(2)
  const dcx2 = +(1 / (1/drawOdds + 1/awayOdds)).toFixed(2)

  return [
    {
      id: 'match-result',
      name: 'Match Result',
      selections: [
        { id: '1', name: '1', label: '1', odds: homeOdds },
        { id: 'X', name: 'X', label: 'X', odds: drawOdds },
        { id: '2', name: '2', label: '2', odds: awayOdds }
      ]
    },
    {
      id: 'over-under',
      name: `Over/Under ${overUnder.line}`,
      selections: [
        { id: 'over', name: 'Over', label: 'Over', odds: overUnder.over, isLocked: locked?.ou },
        { id: 'under', name: 'Under', label: 'Under', odds: overUnder.under, isLocked: locked?.ou }
      ]
    },
    {
      id: 'both-teams-score',
      name: 'Both Teams Score',
      selections: [
        { id: 'yes', name: 'Yes', label: 'Yes', odds: bts.yes, isLocked: locked?.bts },
        { id: 'no', name: 'No', label: 'No', odds: bts.no, isLocked: locked?.bts }
      ]
    },
    {
      id: 'double-chance',
      name: 'Double Chance',
      selections: [
        { id: '1X', name: '1X', label: '1X', odds: dc1x },
        { id: '12', name: '12', label: '12', odds: dc12 },
        { id: 'X2', name: 'X2', label: 'X2', odds: dcx2 }
      ]
    }
  ]
}

export const mockMatches: Match[] = [
  // ─── LIVE MATCHES ───
  {
    id: 1001,
    homeTeam: 'Galatasaray',
    awayTeam: 'Fenerbahçe',
    leagueId: 4,
    leagueName: 'Süper Lig',
    sportId: 1,
    sportName: 'Football',
    countryName: 'Turkey',
    countryFlag: '🇹🇷',
    status: 'live',
    score: { home: 2, away: 1 },
    minute: 67,
    period: '2H',
    startTime: '2025-06-15T18:00:00Z',
    odds: { home: 1.45, draw: 4.50, away: 6.00 },
    markets: createFootballMarkets(1.45, 4.50, 6.00, { over: 1.35, under: 3.10, line: '2.5' }, { yes: 1.55, no: 2.30 }),
    marketsCount: 142,
    isPopular: true,
    corners: { home: 5, away: 3 },
    yellowCards: { home: 2, away: 1 }
  },
  {
    id: 1002,
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    leagueId: 5,
    leagueName: 'Premier League',
    sportId: 1,
    sportName: 'Football',
    countryName: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    status: 'live',
    score: { home: 0, away: 0 },
    minute: 23,
    period: '1H',
    startTime: '2025-06-15T19:00:00Z',
    odds: { home: 2.10, draw: 3.40, away: 3.20 },
    markets: createFootballMarkets(2.10, 3.40, 3.20, { over: 1.72, under: 2.05, line: '2.5' }, { yes: 1.80, no: 1.95 }),
    marketsCount: 198,
    isPopular: true,
    corners: { home: 2, away: 1 },
    yellowCards: { home: 0, away: 1 }
  },
  {
    id: 1006,
    homeTeam: 'PSG',
    awayTeam: 'Marseille',
    leagueId: 9,
    leagueName: 'Ligue 1',
    sportId: 1,
    sportName: 'Football',
    countryName: 'France',
    countryFlag: '🇫🇷',
    status: 'live',
    score: { home: 3, away: 0 },
    minute: 82,
    period: '2H',
    startTime: '2025-06-15T17:00:00Z',
    odds: { home: 1.05, draw: 12.00, away: 30.00 },
    markets: createFootballMarkets(1.05, 12.00, 30.00, { over: 1.12, under: 5.50, line: '2.5' }, { yes: 3.20, no: 1.28 }, { bts: true }),
    marketsCount: 88
  },
  {
    id: 1009,
    homeTeam: 'Başakşehir',
    awayTeam: 'Antalyaspor',
    leagueId: 4,
    leagueName: 'Süper Lig',
    sportId: 1,
    sportName: 'Football',
    countryName: 'Turkey',
    countryFlag: '🇹🇷',
    status: 'live',
    score: { home: 1, away: 1 },
    minute: 45,
    period: 'HT',
    startTime: '2025-06-15T18:00:00Z',
    odds: { home: 2.40, draw: 3.20, away: 2.90 },
    markets: createFootballMarkets(2.40, 3.20, 2.90, { over: 1.90, under: 1.85, line: '2.5' }, { yes: 1.40, no: 2.75 }),
    marketsCount: 112,
    corners: { home: 3, away: 2 },
    yellowCards: { home: 1, away: 2 }
  },

  // ─── PREMATCH MATCHES ───
  {
    id: 1003,
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    leagueId: 7,
    leagueName: 'La Liga',
    sportId: 1,
    sportName: 'Football',
    countryName: 'Spain',
    countryFlag: '🇪🇸',
    status: 'prematch',
    startTime: '2025-06-16T20:00:00Z',
    odds: { home: 2.30, draw: 3.25, away: 2.90 },
    markets: createFootballMarkets(2.30, 3.25, 2.90, { over: 1.85, under: 1.90, line: '2.5' }, { yes: 1.65, no: 2.15 }),
    marketsCount: 210,
    isPopular: true
  },
  {
    id: 1004,
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    leagueId: 6,
    leagueName: 'Bundesliga',
    sportId: 1,
    sportName: 'Football',
    countryName: 'Germany',
    countryFlag: '🇩🇪',
    status: 'prematch',
    startTime: '2025-06-16T17:30:00Z',
    odds: { home: 1.55, draw: 4.20, away: 5.50 },
    markets: createFootballMarkets(1.55, 4.20, 5.50, { over: 1.50, under: 2.45, line: '2.5' }, { yes: 1.70, no: 2.05 }),
    marketsCount: 176,
    isPopular: true
  },
  {
    id: 1005,
    homeTeam: 'AC Milan',
    awayTeam: 'Inter Milan',
    leagueId: 8,
    leagueName: 'Serie A',
    sportId: 1,
    sportName: 'Football',
    countryName: 'Italy',
    countryFlag: '🇮🇹',
    status: 'prematch',
    startTime: '2025-06-17T19:45:00Z',
    odds: { home: 2.70, draw: 3.10, away: 2.55 },
    markets: createFootballMarkets(2.70, 3.10, 2.55, { over: 1.80, under: 1.95, line: '2.5' }, { yes: 1.75, no: 2.00 }),
    marketsCount: 165,
    isPopular: true
  },
  {
    id: 1007,
    homeTeam: 'Beşiktaş',
    awayTeam: 'Trabzonspor',
    leagueId: 4,
    leagueName: 'Süper Lig',
    sportId: 1,
    sportName: 'Football',
    countryName: 'Turkey',
    countryFlag: '🇹🇷',
    status: 'prematch',
    startTime: '2025-06-17T18:00:00Z',
    odds: { home: 1.90, draw: 3.50, away: 3.80 },
    markets: createFootballMarkets(1.90, 3.50, 3.80, { over: 1.75, under: 2.00, line: '2.5' }, { yes: 1.85, no: 1.90 }),
    marketsCount: 134
  },
  {
    id: 1010,
    homeTeam: 'Chelsea',
    awayTeam: 'Arsenal',
    leagueId: 5,
    leagueName: 'Premier League',
    sportId: 1,
    sportName: 'Football',
    countryName: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    status: 'prematch',
    startTime: '2025-06-18T15:00:00Z',
    odds: { home: 3.10, draw: 3.30, away: 2.20 },
    markets: createFootballMarkets(3.10, 3.30, 2.20, { over: 1.82, under: 1.92, line: '2.5' }, { yes: 1.72, no: 2.03 }),
    marketsCount: 188
  },
  {
    id: 1011,
    homeTeam: 'Juventus',
    awayTeam: 'Napoli',
    leagueId: 8,
    leagueName: 'Serie A',
    sportId: 1,
    sportName: 'Football',
    countryName: 'Italy',
    countryFlag: '🇮🇹',
    status: 'prematch',
    startTime: '2025-06-16T20:45:00Z',
    odds: { home: 2.20, draw: 3.40, away: 3.10 },
    markets: createFootballMarkets(2.20, 3.40, 3.10, { over: 1.88, under: 1.87, line: '2.5' }, { yes: 1.78, no: 1.97 }),
    marketsCount: 155,
    isPopular: true
  },
  {
    id: 1012,
    homeTeam: 'Atletico Madrid',
    awayTeam: 'Sevilla',
    leagueId: 7,
    leagueName: 'La Liga',
    sportId: 1,
    sportName: 'Football',
    countryName: 'Spain',
    countryFlag: '🇪🇸',
    status: 'prematch',
    startTime: '2025-06-17T21:00:00Z',
    odds: { home: 1.75, draw: 3.60, away: 4.50 },
    markets: createFootballMarkets(1.75, 3.60, 4.50, { over: 1.95, under: 1.80, line: '2.5' }, { yes: 1.82, no: 1.93 }),
    marketsCount: 148
  }
]

export const liveMatches = mockMatches.filter(m => m.status === 'live')
export const prematchMatches = mockMatches.filter(m => m.status === 'prematch')
export const popularMatches = mockMatches.filter(m => m.isPopular)

// Group matches by league
export interface LeagueGroup {
  leagueId: number
  leagueName: string
  countryName: string
  countryFlag: string
  matches: Match[]
}

export function groupMatchesByLeague(matches: Match[]): LeagueGroup[] {
  const grouped = new Map<number, LeagueGroup>()
  for (const match of matches) {
    if (!grouped.has(match.leagueId)) {
      grouped.set(match.leagueId, {
        leagueId: match.leagueId,
        leagueName: match.leagueName,
        countryName: match.countryName,
        countryFlag: match.countryFlag,
        matches: []
      })
    }
    grouped.get(match.leagueId)!.matches.push(match)
  }
  return Array.from(grouped.values())
}
