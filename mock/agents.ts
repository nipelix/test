export interface Agent {
  id: number
  username: string
  status: 'active' | 'inactive'
  balance: number
  dealerCount: number
  createdAt: string
  lastLogin: string | null
  lastLoginIp: string
}

export const mockAgents: Agent[] = [
  { id: 2, username: 'agent', status: 'active', balance: 0, dealerCount: 1, createdAt: '2026-02-24T21:54:00Z', lastLogin: null, lastLoginIp: '' },
  { id: 4, username: 'agent01', status: 'active', balance: 5000, dealerCount: 2, createdAt: '2024-02-01T00:00:00Z', lastLogin: '2025-06-12T09:15:00Z', lastLoginIp: '172.16.0.10' },
  { id: 8, username: 'agent02', status: 'active', balance: 2500, dealerCount: 1, createdAt: '2024-06-01T00:00:00Z', lastLogin: '2025-06-11T11:00:00Z', lastLoginIp: '172.16.0.11' },
  { id: 9, username: 'agent03', status: 'inactive', balance: 0, dealerCount: 0, createdAt: '2024-08-15T00:00:00Z', lastLogin: '2025-04-01T08:00:00Z', lastLoginIp: '172.16.0.12' }
]
