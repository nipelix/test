export interface Game {
  id: number
  name: string
  slug: string
  image: string
  category: 'originals' | 'popular' | 'new' | 'spotlight'
  active: boolean
}

export const mockGames: Game[] = [
  { id: 1, name: 'Pirates', slug: 'pirates', image: '/images/games/pirates.jpg', category: 'originals', active: true },
  { id: 2, name: 'Zeppelin', slug: 'zeppelin', image: '/images/games/zeppelin.jpg', category: 'popular', active: true },
  { id: 3, name: 'Aviator', slug: 'aviator', image: '/images/games/aviator.jpg', category: 'popular', active: true },
  { id: 4, name: 'Double', slug: 'double', image: '/images/games/double.jpg', category: 'originals', active: true },
  { id: 5, name: 'Mines', slug: 'mines', image: '/images/games/mines.jpg', category: 'originals', active: true },
  { id: 6, name: 'Coinflip', slug: 'coinflip', image: '/images/games/coinflip.jpg', category: 'new', active: true }
]

export interface LatestWin {
  id: number
  username: string
  gameName: string
  amount: number
  multiplier: number
  createdAt: string
}

export const mockLatestWins: LatestWin[] = [
  { id: 1, username: 'player01', gameName: 'Aviator', amount: 1250.00, multiplier: 12.5, createdAt: '2025-06-15T10:30:00Z' },
  { id: 2, username: 'player05', gameName: 'Mines', amount: 450.00, multiplier: 3.6, createdAt: '2025-06-15T09:45:00Z' },
  { id: 3, username: 'player08', gameName: 'Zeppelin', amount: 800.00, multiplier: 8.0, createdAt: '2025-06-15T08:20:00Z' },
  { id: 4, username: 'player02', gameName: 'Double', amount: 200.00, multiplier: 2.0, createdAt: '2025-06-14T22:10:00Z' },
  { id: 5, username: 'player10', gameName: 'Pirates', amount: 3500.00, multiplier: 35.0, createdAt: '2025-06-14T20:00:00Z' }
]
