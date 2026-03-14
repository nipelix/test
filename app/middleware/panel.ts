import { canAccessDashboard, isRole } from '~~/shared/types/roles'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const localePath = useLocalePath()

  // auth.global.ts already redirects unauthenticated users,
  // but guard defensively for direct middleware usage
  const role = auth.user?.role
  if (!role || !isRole(role)) {
    return navigateTo(localePath('/sign-in'))
  }

  // Only dashboard roles can access /panel
  if (!canAccessDashboard(role)) {
    return navigateTo(localePath('/sportsbook'))
  }

  // Check page-level role restriction via route meta
  const allowedRoles = to.meta.allowedRoles
  if (allowedRoles && !allowedRoles.includes(role)) {
    return navigateTo(localePath('/panel'))
  }
})
