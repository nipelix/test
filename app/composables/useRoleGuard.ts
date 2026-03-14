import { isRoleAbove, canManageBalance, canCreateRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

export function useRoleGuard() {
  const auth = useAuthStore()
  const role = computed<Role>(() => (auth.user?.role as Role) || 'PLAYER')

  function hasRole(...roles: Role[]): boolean {
    return roles.includes(role.value)
  }

  function isAbove(target: Role): boolean {
    return isRoleAbove(role.value, target)
  }

  function canCreate(target: Role): boolean {
    return canCreateRole(role.value, target)
  }

  function canManage(target: Role): boolean {
    return canManageBalance(role.value, target)
  }

  return {
    role,
    hasRole,
    isAbove,
    canCreate,
    canManage
  }
}
