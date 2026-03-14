import { eq } from 'drizzle-orm'
import { countries, translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateCountrySchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.code !== undefined) updateData.code = body.code
  if (body.slug !== undefined) updateData.slug = body.slug
  if (body.flag !== undefined) updateData.flag = body.flag
  if (body.active !== undefined) updateData.active = body.active

  if (Object.keys(updateData).length === 1 && !body.translations?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  let updated
  if (Object.keys(updateData).length > 1) {
    const [result] = await db.update(countries).set(updateData).where(eq(countries.id, id)).returning()
    updated = result
  } else {
    const [result] = await db.select().from(countries).where(eq(countries.id, id))
    updated = result
  }

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Country not found' })
  }

  if (body.translations?.length) {
    for (const t of body.translations) {
      await db.insert(translations).values({
        entityType: 'COUNTRY',
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
