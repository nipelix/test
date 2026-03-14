export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/')) return

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const isLoginEndpoint = url.pathname === '/api/auth/login'

  // Session check & preferences are called frequently (plugin init, HMR, navigation)
  // Use a much higher limit for these read-only authenticated endpoints
  const isSessionEndpoint = url.pathname === '/api/auth/me' || url.pathname === '/api/user/preferences'

  const limit = isLoginEndpoint ? 20 : isSessionEndpoint ? 1000 : 100
  const windowSeconds = 900 // 15 minutes

  const redis = useRedis()
  const bucket = isLoginEndpoint ? 'login' : isSessionEndpoint ? 'session' : 'api'
  const key = `ratelimit:${bucket}:${ip}`

  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, windowSeconds)
  }

  if (current > limit) {
    const ttl = await redis.ttl(key)
    setResponseHeader(event, 'Retry-After', String(ttl > 0 ? ttl : windowSeconds))
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
})
