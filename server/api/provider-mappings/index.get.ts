import { eq, and } from 'drizzle-orm'
import { providerMappings, providers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const entityType = query.entityType as string | undefined
  const entityId = query.entityId as string | undefined

  const db = useDb()
  const conditions = []

  if (entityType) conditions.push(eq(providerMappings.entityType, entityType as any))
  if (entityId) conditions.push(eq(providerMappings.entityId, Number(entityId)))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const data = await db.select({
    id: providerMappings.id,
    providerId: providerMappings.providerId,
    providerName: providers.name,
    providerSlug: providers.slug,
    entityType: providerMappings.entityType,
    entityId: providerMappings.entityId,
    externalId: providerMappings.externalId,
    createdAt: providerMappings.createdAt
  })
    .from(providerMappings)
    .leftJoin(providers, eq(providerMappings.providerId, providers.id))
    .where(where)
    .orderBy(providerMappings.entityType, providerMappings.entityId)

  return { data }
})
