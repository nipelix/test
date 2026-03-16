import { eq, inArray } from 'drizzle-orm'
import { marketTypes, marketTypeTranslations, languages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateMarketTypeSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.slug !== undefined) updateData.slug = body.slug
  if (body.sportId !== undefined) updateData.sportId = body.sportId
  if (body.bettingGroupId !== undefined) updateData.bettingGroupId = body.bettingGroupId
  if (body.category !== undefined) updateData.category = body.category
  if (body.extendsControl !== undefined) updateData.extendsControl = body.extendsControl
  if (body.providerFeedType !== undefined) updateData.providerFeedType = body.providerFeedType
  if (body.selectionsCount !== undefined) updateData.selectionsCount = body.selectionsCount
  if (body.active !== undefined) updateData.active = body.active
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder

  if (Object.keys(updateData).length === 1 && !body.translations?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  let updated
  if (Object.keys(updateData).length > 1) {
    const [result] = await db.update(marketTypes).set(updateData).where(eq(marketTypes.id, id)).returning()
    updated = result
  } else {
    const [result] = await db.select().from(marketTypes).where(eq(marketTypes.id, id))
    updated = result
  }

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Market type not found' })
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
      await db.insert(marketTypeTranslations).values({
        marketTypeId: id,
        languageId,
        field: t.field,
        value: t.value
      }).onConflictDoUpdate({
        target: [marketTypeTranslations.marketTypeId, marketTypeTranslations.languageId, marketTypeTranslations.field],
        set: { value: t.value, updatedAt: new Date() }
      })
    }
  }

  return updated
})
