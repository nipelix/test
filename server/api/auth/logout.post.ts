export default defineEventHandler(async (event) => {
  const sessionId = getSessionIdFromCookie(event)
  if (sessionId) {
    await destroySession(event, sessionId)
  }

  return { success: true }
})
