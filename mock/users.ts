export enum UserRole {
  Dealer = 'dealer',
  SubDealer = 'sub_dealer',
  User = 'user',
  Admin = 'admin',
  Agent = 'agent'
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended'
}

export enum UserBalanceType {
  Credit = 'credit',
  Money = 'money'
}

export interface User {
  id: number
  username: string
  status: UserStatus
  role: UserRole
  balance: number
  balance_type: UserBalanceType
  mainDealer?: string
  dealer?: string
  lastLogin?: string | null
  lastLoginIp?: string
  openBetCount?: number
  unreadMessageCount?: number
  avatar?: number
  createdAt?: string
}

export const currentUser: User = {
  id: 1,
  username: 'admin',
  status: UserStatus.Active,
  role: UserRole.Admin,
  balance: 0,
  balance_type: UserBalanceType.Money,
  openBetCount: 2,
  unreadMessageCount: 3,
  avatar: 1,
  lastLogin: '2025-06-15T10:30:00Z',
  lastLoginIp: '192.168.1.100'
}

export const mockUsers: User[] = [
  currentUser,
  {
    id: 2,
    username: 'dealer01',
    status: UserStatus.Active,
    role: UserRole.Dealer,
    balance: 15000,
    balance_type: UserBalanceType.Credit,
    openBetCount: 5,
    unreadMessageCount: 1,
    avatar: 2,
    lastLogin: '2025-06-14T08:00:00Z',
    lastLoginIp: '10.0.0.50',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 3,
    username: 'subdealer01',
    status: UserStatus.Active,
    role: UserRole.SubDealer,
    balance: 5000,
    balance_type: UserBalanceType.Credit,
    dealer: 'dealer01',
    openBetCount: 3,
    unreadMessageCount: 0,
    avatar: 3,
    lastLogin: '2025-06-13T14:20:00Z',
    lastLoginIp: '10.0.0.51',
    createdAt: '2024-03-15T00:00:00Z'
  },
  {
    id: 4,
    username: 'agent01',
    status: UserStatus.Active,
    role: UserRole.Agent,
    balance: 0,
    balance_type: UserBalanceType.Money,
    openBetCount: 0,
    unreadMessageCount: 2,
    avatar: 4,
    lastLogin: '2025-06-12T09:15:00Z',
    lastLoginIp: '172.16.0.10',
    createdAt: '2024-02-01T00:00:00Z'
  }
]

export const mockPlayers: User[] = [
  { id: 13, username: 'roco', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'alex', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 10, username: 'sinek2', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'alex', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 5, username: 'leos', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'alex', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 11, username: 'lisa', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'john', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 12, username: 'emma', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'john', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 9, username: 'tom', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'john', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 7, username: 'mike', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'john', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 8, username: 'david', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'john', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 6, username: 'sarah', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'john', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' },
  { id: 4, username: 'alex', status: UserStatus.Active, role: UserRole.User, balance: 1000, balance_type: UserBalanceType.Credit, mainDealer: 'john', dealer: 'john', lastLogin: null, lastLoginIp: '', createdAt: '2026-02-24T21:54:00Z' }
]
