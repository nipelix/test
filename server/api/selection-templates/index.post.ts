import { selectionTemplates, translations } from '../../database/schema'

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
    await db.insert(translations).values(
      body.translations.map(t => ({
        entityType: 'SELECTION_TEMPLATE' as const,
        entityId: template.id,
        lang: t.lang,
        field: t.field,
        value: t.value
      }))
    )
  }

  setResponseStatus(event, 201)
  return template
})
