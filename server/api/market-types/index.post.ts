import { inArray } from 'drizzle-orm'
import { marketTypes, marketTypeTranslations, languages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createMarketTypeSchema.parse)
  const db = useDb()

  const [marketType] = await db.insert(marketTypes).values({
    name: body.name,
    slug: body.slug,
    sportId: body.sportId || null,
    bettingGroupId: body.bettingGroupId || null,
    category: body.category || null,
    extendsControl: body.extendsControl,
    providerFeedType: body.providerFeedType || null,
    selectionsCount: body.selectionsCount,
    active: body.active,
    sortOrder: body.sortOrder
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
        marketTypeId: marketType.id,
        languageId: langMap[t.lang],
        field: t.field,
        value: t.value
      }))

    if (rows.length > 0) {
      await db.insert(marketTypeTranslations).values(rows)
    }
  }

  setResponseStatus(event, 201)
  return marketType
})
