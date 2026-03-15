export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'DEALER'])
  const feed = getRouterParam(event, 'feed')
  if (feed !== 'live' && feed !== 'line') throw createError({ statusCode: 400, statusMessage: 'Invalid feed' })
  return { data: [] }
})
