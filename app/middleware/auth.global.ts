export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const localePath = useLocalePath()

  const isProtected = to.path.includes('/panel') || to.path.includes('/sportsbook')
  const isSignIn = to.path.includes('/sign-in')

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !auth.isAuthenticated) {
    return navigateTo(localePath('/sign-in'))
  }

  // Redirect authenticated users away from sign-in
  if (isSignIn && auth.isAuthenticated) {
    return navigateTo(localePath('/panel'))
  }
})
