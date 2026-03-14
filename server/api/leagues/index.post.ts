import { leagues, translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createLeagueSchema.parse)
  const db = useDb()

  const [league] = await db.insert(leagues).values({
    name: body.name,
    sportId: body.sportId,
    countryId: body.countryId,
    category: body.category || null,
    specialIcon: body.specialIcon || null,
    popular: body.popular,
    mostPopular: body.mostPopular,
    mbs: body.mbs,
    type: body.type || null,
    active: body.active,
    sortOrder: body.sortOrder
  }).returning()

  if (body.translations?.length) {
    await db.insert(translations).values(
      body.translations.map(t => ({
        entityType: 'LEAGUE' as const,
        entityId: league.id,
        lang: t.lang,
        field: t.field,
        value: t.value
      }))
    )
  }

  setResponseStatus(event, 201)
  return league
})
