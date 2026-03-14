import { sports, translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createSportSchema.parse)
  const db = useDb()

  const [sport] = await db.insert(sports).values({
    name: body.name,
    slug: body.slug,
    icon: body.icon || null,
    category: body.category || null,
    banner: body.banner || null,
    active: body.active,
    sortOrder: body.sortOrder
  }).returning()

  if (body.translations?.length) {
    await db.insert(translations).values(
      body.translations.map(t => ({
        entityType: 'SPORT' as const,
        entityId: sport.id,
        lang: t.lang,
        field: t.field,
        value: t.value
      }))
    )
  }

  setResponseStatus(event, 201)
  return sport
})
