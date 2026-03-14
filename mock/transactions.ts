export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'payout' | 'refund' | 'credit_add' | 'credit_remove'

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  balance: number
  description: string
  user: string
  createdAt: string
}

export const mockTransactions: Transaction[] = [
  { id: 1, type: 'deposit', amount: 5000, balance: 15000, description: 'Balance deposit', user: 'dealer01', createdAt: '2025-06-15T10:00:00Z' },
  { id: 2, type: 'bet', amount: -100, balance: 14900, description: 'Bet placed - BSN-000001', user: 'player01', createdAt: '2025-06-15T10:30:00Z' },
  { id: 3, type: 'payout', amount: 262.50, balance: 15162.50, description: 'Coupon won - BSN-000004', user: 'player04', createdAt: '2025-06-13T18:00:00Z' },
  { id: 4, type: 'credit_add', amount: 10000, balance: 25000, description: 'Credit added to dealer01', user: 'admin', createdAt: '2025-06-12T09:00:00Z' },
  { id: 5, type: 'refund', amount: 300, balance: 15462.50, description: 'Coupon refunded - BSN-000006', user: 'player06', createdAt: '2025-06-11T14:00:00Z' },
  { id: 6, type: 'withdrawal', amount: -2000, balance: 13462.50, description: 'Balance withdrawal', user: 'dealer01', createdAt: '2025-06-10T16:00:00Z' },
  { id: 7, type: 'bet', amount: -500, balance: 12962.50, description: 'Bet placed - BSN-000008', user: 'player08', createdAt: '2025-06-15T11:00:00Z' },
  { id: 8, type: 'credit_remove', amount: -5000, balance: 7962.50, description: 'Credit removed from subdealer01', user: 'admin', createdAt: '2025-06-09T12:00:00Z' }
]
