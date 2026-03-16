import { z } from 'zod'
import { selectionTemplateProviderMappings } from '../../../database/schema'

const schema = z.object({
  entityId: z.number().int().positive(),
  providerId: z.number().int().positive(),
  externalId: z.number().int()
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const body = await readValidatedBody(event, schema.parse)
  const db = useDb()

  const [mapping] = await db.insert(selectionTemplateProviderMappings).values({
    selectionTemplateId: body.entityId,
    providerId: body.providerId,
    externalId: body.externalId
  }).returning()

  setResponseStatus(event, 201)
  return mapping
})
