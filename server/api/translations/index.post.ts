import { z } from 'zod'
import { translations } from '../../database/schema'

const schema = z.object({
  translations: z.array(z.object({
    entityType: z.string(),
    entityId: z.number().int().positive(),
    lang: z.string().max(10),
    field: z.string().max(50),
    value: z.string().max(500)
  }))
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const body = await readValidatedBody(event, schema.parse)
  const db = useDb()

  const results = []
  for (const tr of body.translations) {
    const [result] = await db.insert(translations).values({
      entityType: tr.entityType as any,
      entityId: tr.entityId,
      lang: tr.lang,
      field: tr.field,
      value: tr.value
    }).onConflictDoUpdate({
      target: [translations.entityType, translations.entityId, translations.lang, translations.field],
      set: { value: tr.value, updatedAt: new Date() }
    }).returning()
    results.push(result)
  }

  setResponseStatus(event, 201)
  return { data: results }
})
