import { z } from 'zod'

const schema = z.object({ entityId: z.number().int().positive() })

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'DEALER'])
  const body = await readValidatedBody(event, schema.parse)
  return { success: true, entityId: body.entityId }
})
