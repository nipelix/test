import { marketTypes, translations } from '../../database/schema'

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
    await db.insert(translations).values(
      body.translations.map(t => ({
        entityType: 'MARKET_TYPE' as const,
        entityId: marketType.id,
        lang: t.lang,
        field: t.field,
        value: t.value
      }))
    )
  }

  setResponseStatus(event, 201)
  return marketType
})
