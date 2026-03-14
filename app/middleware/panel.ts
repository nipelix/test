import { canAccessDashboard } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const localePath = useLocalePath()

  if (!auth.user) {
    return navigateTo(localePath('/sign-in'))
  }

  const role = auth.user.role as Role

  // Only dashboard roles can access /panel
  if (!canAccessDashboard(role)) {
    return navigateTo(localePath('/sportsbook'))
  }

  // Check page-level role restriction via route meta
  const allowedRoles = to.meta.allowedRoles as Role[] | undefined
  if (allowedRoles && !allowedRoles.includes(role)) {
    return navigateTo(localePath('/panel'))
  }
})
