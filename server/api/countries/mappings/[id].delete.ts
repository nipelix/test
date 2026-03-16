import { eq } from 'drizzle-orm'
import { countryProviderMappings } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const db = useDb()
  await db.delete(countryProviderMappings).where(eq(countryProviderMappings.id, id))
  return { success: true }
})
