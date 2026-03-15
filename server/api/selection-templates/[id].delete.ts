import { eq, and } from 'drizzle-orm'
import { selectionTemplates, translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [deleted] = await db.delete(selectionTemplates).where(eq(selectionTemplates.id, id)).returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Selection template not found' })
  }

  await db.delete(translations).where(
    and(
      eq(translations.entityType, 'SELECTION_TEMPLATE'),
      eq(translations.entityId, id)
    )
  )

  return { ok: true }
})
