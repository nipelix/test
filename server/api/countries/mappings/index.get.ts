import { eq } from 'drizzle-orm'
import { countryProviderMappings, providers } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const query = getQuery(event)
  const entityId = Number(query.entityId)
  if (!entityId) throw createError({ statusCode: 400, statusMessage: 'entityId required' })

  const db = useDb()
  const data = await db.select({
    id: countryProviderMappings.id,
    providerId: countryProviderMappings.providerId,
    providerName: providers.name,
    providerSlug: providers.slug,
    countryId: countryProviderMappings.countryId,
    externalId: countryProviderMappings.externalId,
    createdAt: countryProviderMappings.createdAt
  }).from(countryProviderMappings)
    .leftJoin(providers, eq(countryProviderMappings.providerId, providers.id))
    .where(eq(countryProviderMappings.countryId, entityId))

  return { data }
})
