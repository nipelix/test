import { eq, and } from 'drizzle-orm'
import { selectionTemplates, translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateSelectionTemplateSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.groupId !== undefined) updateData.groupId = body.groupId
  if (body.marketGroupId !== undefined) updateData.marketGroupId = body.marketGroupId
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder
  if (body.active !== undefined) updateData.active = body.active
  if (body.statusType !== undefined) updateData.statusType = body.statusType
  if (body.validator !== undefined) updateData.validator = body.validator
  if (body.drawNoBet !== undefined) updateData.drawNoBet = body.drawNoBet
  if (body.period !== undefined) updateData.period = body.period
  if (body.providerFeedType !== undefined) updateData.providerFeedType = body.providerFeedType

  if (Object.keys(updateData).length === 1 && !body.translations?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  let updated
  if (Object.keys(updateData).length > 1) {
    const [result] = await db.update(selectionTemplates).set(updateData).where(eq(selectionTemplates.id, id)).returning()
    updated = result
  } else {
    const [result] = await db.select().from(selectionTemplates).where(eq(selectionTemplates.id, id))
    updated = result
  }

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Selection template not found' })
  }

  if (body.translations?.length) {
    for (const t of body.translations) {
      await db.insert(translations).values({
        entityType: 'SELECTION_TEMPLATE',
        entityId: id,
        lang: t.lang,
        field: t.field,
        value: t.value
      }).onConflictDoUpdate({
        target: [translations.entityType, translations.entityId, translations.lang, translations.field],
        set: { value: t.value, updatedAt: new Date() }
      })
    }
  }

  return updated
})
