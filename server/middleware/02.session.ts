export default defineEventHandler(async (event) => {
  const sessionId = getSessionIdFromCookie(event)

  if (sessionId) {
    const session = await getRedisSession(sessionId)
    event.context.session = session
    event.context.sessionId = session ? sessionId : null
  } else {
    event.context.session = null
    event.context.sessionId = null
  }
})
