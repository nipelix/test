import { eq } from 'drizzle-orm'
import { sportProviderMappings, providers } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const query = getQuery(event)
  const entityId = Number(query.entityId)
  if (!entityId) throw createError({ statusCode: 400, statusMessage: 'entityId required' })

  const db = useDb()
  const data = await db.select({
    id: sportProviderMappings.id,
    providerId: sportProviderMappings.providerId,
    providerName: providers.name,
    providerSlug: providers.slug,
    sportId: sportProviderMappings.sportId,
    externalId: sportProviderMappings.externalId,
    createdAt: sportProviderMappings.createdAt
  }).from(sportProviderMappings)
    .leftJoin(providers, eq(sportProviderMappings.providerId, providers.id))
    .where(eq(sportProviderMappings.sportId, entityId))

  return { data }
})
