import { providerMappings } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createProviderMappingSchema.parse)
  const db = useDb()

  const [mapping] = await db.insert(providerMappings).values({
    providerId: body.providerId,
    entityType: body.entityType,
    entityId: body.entityId,
    externalId: body.externalId
  }).returning()

  setResponseStatus(event, 201)
  return mapping
})
