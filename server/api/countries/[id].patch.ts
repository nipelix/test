import { eq, inArray } from 'drizzle-orm'
import { countries, countryTranslations, languages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateCountrySchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
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
    const langCodes = [...new Set(body.translations.map(t => t.lang))]
    const langRows = await db.select({ id: languages.id, code: languages.code })
      .from(languages)
      .where(inArray(languages.code, langCodes))
    const langMap: Record<string, number> = {}
    for (const l of langRows) langMap[l.code] = l.id

    for (const t of body.translations) {
      const languageId = langMap[t.lang]
      if (!languageId) continue
      await db.insert(countryTranslations).values({
        countryId: id,
        languageId,
        field: t.field,
        value: t.value
      }).onConflictDoUpdate({
        target: [countryTranslations.countryId, countryTranslations.languageId, countryTranslations.field],
        set: { value: t.value, updatedAt: new Date() }
      })
    }
  }

  return updated
})
