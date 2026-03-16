import { eq } from 'drizzle-orm'
import { marketTypeProviderMappings, providers } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const query = getQuery(event)
  const entityId = Number(query.entityId)
  if (!entityId) throw createError({ statusCode: 400, statusMessage: 'entityId required' })

  const db = useDb()
  const data = await db.select({
    id: marketTypeProviderMappings.id,
    providerId: marketTypeProviderMappings.providerId,
    providerName: providers.name,
    providerSlug: providers.slug,
    marketTypeId: marketTypeProviderMappings.marketTypeId,
    externalId: marketTypeProviderMappings.externalId,
    createdAt: marketTypeProviderMappings.createdAt
  }).from(marketTypeProviderMappings)
    .leftJoin(providers, eq(marketTypeProviderMappings.providerId, providers.id))
    .where(eq(marketTypeProviderMappings.marketTypeId, entityId))

  return { data }
})
