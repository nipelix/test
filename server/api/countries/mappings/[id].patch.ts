import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { countryProviderMappings } from '../../../database/schema'

const schema = z.object({
  externalId: z.number().int().optional(),
  providerId: z.number().int().positive().optional()
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readValidatedBody(event, schema.parse)
  const db = useDb()

  const [updated] = await db.update(countryProviderMappings).set(body).where(eq(countryProviderMappings.id, id)).returning()
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Mapping not found' })
  return updated
})
