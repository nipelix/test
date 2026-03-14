export default defineEventHandler((event) => {
  const method = getMethod(event)
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return

  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/')) return

  const origin = getRequestHeader(event, 'origin')
  const host = getRequestHeader(event, 'host')

  if (!origin || !host) return

  const originHost = new URL(origin).host
  if (originHost !== host) {
    throw createError({ statusCode: 403, statusMessage: 'CSRF validation failed' })
  }
})
