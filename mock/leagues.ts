export interface League {
  id: number
  name: string
  countryId: number
  countryName: string
  countryFlag: string
  sportId: number
  sportName: string
  active: boolean
  sortOrder: number
  matchCount: number
}

export const mockLeagues: League[] = [
  { id: 1, name: 'UEFA Champions League', countryId: 0, countryName: 'Europe', countryFlag: '🇪🇺', sportId: 1, sportName: 'Football', active: true, sortOrder: 1, matchCount: 16 },
  { id: 2, name: 'UEFA Europa League', countryId: 0, countryName: 'Europe', countryFlag: '🇪🇺', sportId: 1, sportName: 'Football', active: true, sortOrder: 2, matchCount: 32 },
  { id: 3, name: 'UEFA Conference League', countryId: 0, countryName: 'Europe', countryFlag: '🇪🇺', sportId: 1, sportName: 'Football', active: true, sortOrder: 3, matchCount: 32 },
  { id: 4, name: 'Süper Lig', countryId: 1, countryName: 'Turkey', countryFlag: '🇹🇷', sportId: 1, sportName: 'Football', active: true, sortOrder: 4, matchCount: 9 },
  { id: 5, name: 'Premier League', countryId: 2, countryName: 'England', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sportId: 1, sportName: 'Football', active: true, sortOrder: 5, matchCount: 10 },
  { id: 6, name: 'Bundesliga', countryId: 3, countryName: 'Germany', countryFlag: '🇩🇪', sportId: 1, sportName: 'Football', active: true, sortOrder: 6, matchCount: 9 },
  { id: 7, name: 'La Liga', countryId: 4, countryName: 'Spain', countryFlag: '🇪🇸', sportId: 1, sportName: 'Football', active: true, sortOrder: 7, matchCount: 10 },
  { id: 8, name: 'Serie A', countryId: 5, countryName: 'Italy', countryFlag: '🇮🇹', sportId: 1, sportName: 'Football', active: true, sortOrder: 8, matchCount: 10 },
  { id: 9, name: 'Ligue 1', countryId: 6, countryName: 'France', countryFlag: '🇫🇷', sportId: 1, sportName: 'Football', active: true, sortOrder: 9, matchCount: 10 },
  { id: 10, name: 'Eredivisie', countryId: 7, countryName: 'Netherlands', countryFlag: '🇳🇱', sportId: 1, sportName: 'Football', active: true, sortOrder: 10, matchCount: 9 },
  { id: 11, name: 'NBA', countryId: 11, countryName: 'United States', countryFlag: '🇺🇸', sportId: 2, sportName: 'Basketball', active: true, sortOrder: 11, matchCount: 8 },
  { id: 12, name: 'EuroLeague', countryId: 0, countryName: 'Europe', countryFlag: '🇪🇺', sportId: 2, sportName: 'Basketball', active: true, sortOrder: 12, matchCount: 8 },
  { id: 13, name: 'ATP Tour', countryId: 0, countryName: 'International', countryFlag: '🌍', sportId: 3, sportName: 'Tennis', active: true, sortOrder: 13, matchCount: 32 },
  { id: 14, name: 'WTA Tour', countryId: 0, countryName: 'International', countryFlag: '🌍', sportId: 3, sportName: 'Tennis', active: true, sortOrder: 14, matchCount: 24 },
  { id: 15, name: 'Primeira Liga', countryId: 8, countryName: 'Portugal', countryFlag: '🇵🇹', sportId: 1, sportName: 'Football', active: true, sortOrder: 15, matchCount: 9 },
  { id: 16, name: 'Brasileirão', countryId: 9, countryName: 'Brazil', countryFlag: '🇧🇷', sportId: 1, sportName: 'Football', active: true, sortOrder: 16, matchCount: 10 },
  { id: 17, name: 'Argentine Primera', countryId: 10, countryName: 'Argentina', countryFlag: '🇦🇷', sportId: 1, sportName: 'Football', active: true, sortOrder: 17, matchCount: 14 },
  { id: 18, name: 'Russian Premier League', countryId: 12, countryName: 'Russia', countryFlag: '🇷🇺', sportId: 1, sportName: 'Football', active: true, sortOrder: 18, matchCount: 8 },
  { id: 19, name: 'Belgian Pro League', countryId: 13, countryName: 'Belgium', countryFlag: '🇧🇪', sportId: 1, sportName: 'Football', active: true, sortOrder: 19, matchCount: 8 },
  { id: 20, name: 'Scottish Premiership', countryId: 14, countryName: 'Scotland', countryFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', sportId: 1, sportName: 'Football', active: true, sortOrder: 20, matchCount: 6 }
]

export const popularLeagues = mockLeagues.filter(l => [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(l.id))
