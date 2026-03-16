import { eq, inArray } from 'drizzle-orm'
import { leagues, leagueTranslations, languages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateLeagueSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.sportId !== undefined) updateData.sportId = body.sportId
  if (body.countryId !== undefined) updateData.countryId = body.countryId
  if (body.category !== undefined) updateData.category = body.category
  if (body.specialIcon !== undefined) updateData.specialIcon = body.specialIcon
  if (body.popular !== undefined) updateData.popular = body.popular
  if (body.mostPopular !== undefined) updateData.mostPopular = body.mostPopular
  if (body.mbs !== undefined) updateData.mbs = body.mbs
  if (body.type !== undefined) updateData.type = body.type
  if (body.active !== undefined) updateData.active = body.active
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder

  if (Object.keys(updateData).length === 1 && !body.translations?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  let updated
  if (Object.keys(updateData).length > 1) {
    const [result] = await db.update(leagues).set(updateData).where(eq(leagues.id, id)).returning()
    updated = result
  } else {
    const [result] = await db.select().from(leagues).where(eq(leagues.id, id))
    updated = result
  }

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'League not found' })
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
      await db.insert(leagueTranslations).values({
        leagueId: id,
        languageId,
        field: t.field,
        value: t.value
      }).onConflictDoUpdate({
        target: [leagueTranslations.leagueId, leagueTranslations.languageId, leagueTranslations.field],
        set: { value: t.value, updatedAt: new Date() }
      })
    }
  }

  return updated
})
