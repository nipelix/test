// ── User Roles ──
export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER', 'PLAYER'] as const
export type Role = typeof ROLES[number]

export function isRole(value: string): value is Role {
  return (ROLES as ReadonlyArray<string>).includes(value)
}

// ── Wallet Types ──
export const WALLET_TYPES = ['CREDIT', 'MONEY', 'NONE'] as const
export type WalletType = typeof WALLET_TYPES[number]

// ── Role Hierarchy (numeric level, lower = higher authority) ──
export const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  AGENT: 2,
  DEALER: 3,
  SUB_DEALER: 4,
  PLAYER: 5
}

// ── Wallet type per role ──
export const ROLE_WALLET_TYPE: Record<Role, WalletType> = {
  SUPER_ADMIN: 'NONE',
  ADMIN: 'NONE',
  AGENT: 'CREDIT',
  DEALER: 'CREDIT',
  SUB_DEALER: 'MONEY',
  PLAYER: 'MONEY'
}

// ── Parent selection rules when creating a user ──
// 'none'  = no parent selection needed (parent is the creator)
// 'required' = a specific parent role must be selected, with an optional alternate
export type ParentRequirement =
  | { kind: 'none' }
  | { kind: 'required'; parent: Role; alternateParent?: Role }

export const PARENT_REQUIREMENTS: Record<Role, ParentRequirement> = {
  SUPER_ADMIN: { kind: 'none' },
  ADMIN: { kind: 'none' },
  AGENT: { kind: 'none' },
  DEALER: { kind: 'required', parent: 'ADMIN', alternateParent: 'AGENT' },
  SUB_DEALER: { kind: 'required', parent: 'DEALER' },
  PLAYER: { kind: 'required', parent: 'SUB_DEALER' }
}

// ── Credit flow rules ──
// Defines which role can give credit/balance to which roles.
// This is intentionally narrower than the creation hierarchy:
//   e.g. SUPER_ADMIN can create all roles but only gives credit to ADMIN
export const CREDIT_FLOW: Record<Role, ReadonlyArray<Role>> = {
  SUPER_ADMIN: ['ADMIN'],
  ADMIN: ['AGENT', 'DEALER'],
  AGENT: ['DEALER'],
  DEALER: ['SUB_DEALER'],
  SUB_DEALER: ['PLAYER'],
  PLAYER: []
}

// ── Helper functions ──

export function isRoleAbove(actor: Role, target: Role): boolean {
  return ROLE_LEVEL[actor] < ROLE_LEVEL[target]
}

export function canCreateRole(actor: Role, target: Role): boolean {
  return isRoleAbove(actor, target)
}

export function canAccessDashboard(role: Role): boolean {
  return role !== 'PLAYER'
}

export function canManageBalance(actor: Role, target: Role): boolean {
  return CREDIT_FLOW[actor].includes(target)
}
