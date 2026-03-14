export interface Dealer {
  id: number
  username: string
  agentUsername: string
  status: 'active' | 'inactive' | 'suspended'
  balance: number
  credit: number
  playerCount: number
  subDealerCount: number
  createdAt: string
  lastLogin: string | null
  lastLoginIp: string
}

export interface SubDealer {
  id: number
  username: string
  mainDealerUsername: string
  status: 'active' | 'inactive' | 'suspended'
  balance: number
  totalBalance: number
  credit: number
  dealerUsername: string
  playerCount: number
  createdAt: string
  lastLogin: string | null
  lastLoginIp: string
}

export const mockDealers: Dealer[] = [
  { id: 3, username: 'john', agentUsername: 'agent', status: 'active', balance: 15000, credit: 100, playerCount: 45, subDealerCount: 3, createdAt: '2026-02-24T21:54:00Z', lastLogin: '2026-02-25T01:41:00Z', lastLoginIp: '127.0.0.1' },
  { id: 5, username: 'dealer02', agentUsername: 'agent', status: 'active', balance: 8500, credit: 25000, playerCount: 22, subDealerCount: 1, createdAt: '2024-02-20T00:00:00Z', lastLogin: '2025-06-13T10:00:00Z', lastLoginIp: '10.0.0.52' }
]

export const mockSubDealers: SubDealer[] = [
  { id: 11, username: 'lisa', mainDealerUsername: 'john', status: 'active', balance: 1000, totalBalance: 1000, credit: 10000, dealerUsername: 'john', playerCount: 15, createdAt: '2026-02-24T21:54:00Z', lastLogin: null, lastLoginIp: '' },
  { id: 12, username: 'emma', mainDealerUsername: 'john', status: 'active', balance: 1000, totalBalance: 1000, credit: 8000, dealerUsername: 'john', playerCount: 10, createdAt: '2026-02-24T21:54:00Z', lastLogin: null, lastLoginIp: '' },
  { id: 9, username: 'tom', mainDealerUsername: 'john', status: 'active', balance: 1000, totalBalance: 1000, credit: 5000, dealerUsername: 'john', playerCount: 8, createdAt: '2026-02-24T21:54:00Z', lastLogin: null, lastLoginIp: '' },
  { id: 7, username: 'mike', mainDealerUsername: 'john', status: 'active', balance: 1000, totalBalance: 1000, credit: 5000, dealerUsername: 'john', playerCount: 5, createdAt: '2026-02-24T21:54:00Z', lastLogin: null, lastLoginIp: '' },
  { id: 8, username: 'david', mainDealerUsername: 'john', status: 'active', balance: 1000, totalBalance: 1000, credit: 5000, dealerUsername: 'john', playerCount: 7, createdAt: '2026-02-24T21:54:00Z', lastLogin: null, lastLoginIp: '' },
  { id: 6, username: 'sarah', mainDealerUsername: 'john', status: 'active', balance: 1000, totalBalance: 1000, credit: 5000, dealerUsername: 'john', playerCount: 4, createdAt: '2026-02-24T21:54:00Z', lastLogin: null, lastLoginIp: '' },
  { id: 4, username: 'alex', mainDealerUsername: 'john', status: 'active', balance: 1000, totalBalance: 4000, credit: 5000, dealerUsername: 'john', playerCount: 3, createdAt: '2026-02-24T21:54:00Z', lastLogin: null, lastLoginIp: '' }
]
