import { translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, bulkTranslationSchema.parse)
  const db = useDb()

  const results = []
  for (const t of body.translations) {
    const [result] = await db.insert(translations).values({
      entityType: body.entityType,
      entityId: body.entityId,
      lang: t.lang,
      field: t.field,
      value: t.value
    }).onConflictDoUpdate({
      target: [translations.entityType, translations.entityId, translations.lang, translations.field],
      set: { value: t.value, updatedAt: new Date() }
    }).returning()
    results.push(result)
  }

  setResponseStatus(event, 201)
  return { data: results }
})
