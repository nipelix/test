import { eq } from 'drizzle-orm'
import { selectionTemplateProviderMappings, providers } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const query = getQuery(event)
  const entityId = Number(query.entityId)
  if (!entityId) throw createError({ statusCode: 400, statusMessage: 'entityId required' })

  const db = useDb()
  const data = await db.select({
    id: selectionTemplateProviderMappings.id,
    providerId: selectionTemplateProviderMappings.providerId,
    providerName: providers.name,
    providerSlug: providers.slug,
    selectionTemplateId: selectionTemplateProviderMappings.selectionTemplateId,
    externalId: selectionTemplateProviderMappings.externalId,
    createdAt: selectionTemplateProviderMappings.createdAt
  }).from(selectionTemplateProviderMappings)
    .leftJoin(providers, eq(selectionTemplateProviderMappings.providerId, providers.id))
    .where(eq(selectionTemplateProviderMappings.selectionTemplateId, entityId))

  return { data }
})
