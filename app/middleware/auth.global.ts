export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const localePath = useLocalePath()

  const isAuthRoute = to.path.includes('/panel') || to.path.includes('/sportsbook')
  const isSignIn = to.path.includes('/sign-in')

  if (isAuthRoute && !auth.isAuthenticated) {
    return navigateTo(localePath('/sign-in'))
  }

  if (isSignIn && auth.isAuthenticated) {
    return navigateTo(localePath('/panel'))
  }
})
