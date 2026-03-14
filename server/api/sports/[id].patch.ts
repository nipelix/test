import { eq } from 'drizzle-orm'
import { sports, translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateSportSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.slug !== undefined) updateData.slug = body.slug
  if (body.icon !== undefined) updateData.icon = body.icon
  if (body.category !== undefined) updateData.category = body.category
  if (body.banner !== undefined) updateData.banner = body.banner
  if (body.active !== undefined) updateData.active = body.active
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder

  if (Object.keys(updateData).length === 1 && !body.translations?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  let updated
  if (Object.keys(updateData).length > 1) {
    const [result] = await db.update(sports).set(updateData).where(eq(sports.id, id)).returning()
    updated = result
  } else {
    const [result] = await db.select().from(sports).where(eq(sports.id, id))
    updated = result
  }

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Sport not found' })
  }

  if (body.translations?.length) {
    for (const t of body.translations) {
      await db.insert(translations).values({
        entityType: 'SPORT',
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
