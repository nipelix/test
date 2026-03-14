import type { H3Event } from 'h3'
import type { SessionData } from './session'
import { ROLE_LEVEL, isRoleAbove, canCreateRole, isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

export { isRoleAbove, canCreateRole, isRole }

export function getRoleLevel(role: string): number {
  if (!isRole(role)) return 99
  return ROLE_LEVEL[role]
}

export function requireAuth(event: H3Event): SessionData {
  const session = event.context.session
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return session
}

export function requireRole(event: H3Event, allowedRoles: string[]): SessionData {
  const session = requireAuth(event)
  if (!allowedRoles.includes(session.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' })
  }
  return session
}

export async function requireTreeAccess(event: H3Event, targetUserId: number): Promise<SessionData> {
  const session = requireAuth(event)

  // Users can always access themselves
  if (session.userId === targetUserId) return session

  // SUPER_ADMIN can access everyone
  if (session.role === 'SUPER_ADMIN') return session

  // Check if target is a descendant
  const hasAccess = await isDescendant(session.userId, targetUserId)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied: user not in your subtree' })
  }

  return session
}
