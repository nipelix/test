import { currentUser, mockUsers, mockPlayers } from '@mock/users'
import { mockSports, popularSports, allActiveSports } from '@mock/sports'
import { mockCountries } from '@mock/countries'
import { mockLeagues, popularLeagues } from '@mock/leagues'
import { mockMatches, liveMatches, prematchMatches, popularMatches, groupMatchesByLeague } from '@mock/matches'
import { mockCoupons, activeCoupons, trashedCoupons } from '@mock/coupons'
import { mockDealers, mockSubDealers } from '@mock/dealers'
import { mockAgents } from '@mock/agents'
import { mockTransactions } from '@mock/transactions'
import { mockMessages } from '@mock/messages'
import { mockGames, mockLatestWins } from '@mock/games'
import { defaultBettingRules, mockBettingGroups, mockCategories } from '@mock/betting-rules'

export function useMockData() {
  return {
    currentUser,
    users: mockUsers,
    players: mockPlayers,
    sports: mockSports,
    popularSports,
    allActiveSports,
    countries: mockCountries,
    leagues: mockLeagues,
    popularLeagues,
    matches: mockMatches,
    liveMatches,
    prematchMatches,
    popularMatches,
    groupMatchesByLeague,
    coupons: mockCoupons,
    activeCoupons,
    trashedCoupons,
    dealers: mockDealers,
    subDealers: mockSubDealers,
    agents: mockAgents,
    transactions: mockTransactions,
    messages: mockMessages,
    games: mockGames,
    latestWins: mockLatestWins,
    bettingRules: defaultBettingRules,
    bettingGroups: mockBettingGroups,
    categories: mockCategories
  }
}
