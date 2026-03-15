export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'DEALER'])
  const feed = getRouterParam(event, 'feed')
  const id = Number(getRouterParam(event, 'id'))
  if (feed !== 'live' && feed !== 'line') throw createError({ statusCode: 400, statusMessage: 'Invalid feed' })
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  return { success: true }
})
