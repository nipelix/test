import { eq } from 'drizzle-orm'
import { selectionTemplates } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [deleted] = await db.delete(selectionTemplates).where(eq(selectionTemplates.id, id)).returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Selection template not found' })
  }

  // Translations are automatically deleted via ON DELETE CASCADE

  return { ok: true }
})
