import { isRoleAbove, canManageBalance, canCreateRole, isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

export function useRoleGuard() {
  const auth = useAuthStore()

  const role = computed<Role>(() => {
    const r = auth.user?.role
    return (r && isRole(r)) ? r : 'PLAYER'
  })

  // Reactive computeds for template use (v-if="isAdmin")
  const hasRole = (...roles: Role[]) => computed(() => roles.includes(role.value))
  const isAbove = (target: Role) => computed(() => isRoleAbove(role.value, target))
  const canCreate = (target: Role) => computed(() => canCreateRole(role.value, target))
  const canManage = (target: Role) => computed(() => canManageBalance(role.value, target))

  return {
    role,
    hasRole,
    isAbove,
    canCreate,
    canManage
  }
}
