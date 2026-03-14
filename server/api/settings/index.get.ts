export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const settings = await resolveSettings(session.userId, session.role)
  return settings
})
