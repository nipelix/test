import { inArray } from 'drizzle-orm'
import { selectionTemplates, selectionTemplateTranslations, languages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createSelectionTemplateSchema.parse)
  const db = useDb()

  const [template] = await db.insert(selectionTemplates).values({
    groupId: body.groupId,
    marketGroupId: body.marketGroupId || null,
    sortOrder: body.sortOrder,
    active: body.active,
    statusType: body.statusType || null,
    validator: body.validator || null,
    drawNoBet: body.drawNoBet,
    period: body.period,
    providerFeedType: body.providerFeedType || null
  }).returning()

  if (body.translations?.length) {
    const langCodes = [...new Set(body.translations.map(t => t.lang))]
    const langRows = await db.select({ id: languages.id, code: languages.code })
      .from(languages)
      .where(inArray(languages.code, langCodes))
    const langMap: Record<string, number> = {}
    for (const l of langRows) langMap[l.code] = l.id

    const rows = body.translations
      .filter(t => langMap[t.lang])
      .map(t => ({
        selectionTemplateId: template.id,
        languageId: langMap[t.lang],
        field: t.field,
        value: t.value
      }))

    if (rows.length > 0) {
      await db.insert(selectionTemplateTranslations).values(rows)
    }
  }

  setResponseStatus(event, 201)
  return template
})
