import { eq } from 'drizzle-orm'
import { leagueProviderMappings } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const db = useDb()
  await db.delete(leagueProviderMappings).where(eq(leagueProviderMappings.id, id))
  return { success: true }
})
