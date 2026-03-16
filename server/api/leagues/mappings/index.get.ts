import { eq } from 'drizzle-orm'
import { leagueProviderMappings, providers } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const query = getQuery(event)
  const entityId = Number(query.entityId)
  if (!entityId) throw createError({ statusCode: 400, statusMessage: 'entityId required' })

  const db = useDb()
  const data = await db.select({
    id: leagueProviderMappings.id,
    providerId: leagueProviderMappings.providerId,
    providerName: providers.name,
    providerSlug: providers.slug,
    leagueId: leagueProviderMappings.leagueId,
    externalId: leagueProviderMappings.externalId,
    createdAt: leagueProviderMappings.createdAt
  }).from(leagueProviderMappings)
    .leftJoin(providers, eq(leagueProviderMappings.providerId, providers.id))
    .where(eq(leagueProviderMappings.leagueId, entityId))

  return { data }
})
