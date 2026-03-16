import { inArray } from 'drizzle-orm'
import { leagues, leagueTranslations, languages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createLeagueSchema.parse)
  const db = useDb()

  const [league] = await db.insert(leagues).values({
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
    const langCodes = [...new Set(body.translations.map(t => t.lang))]
    const langRows = await db.select({ id: languages.id, code: languages.code })
      .from(languages)
      .where(inArray(languages.code, langCodes))
    const langMap: Record<string, number> = {}
    for (const l of langRows) langMap[l.code] = l.id

    const rows = body.translations
      .filter(t => langMap[t.lang])
      .map(t => ({
        leagueId: league.id,
        languageId: langMap[t.lang],
        field: t.field,
        value: t.value
      }))

    if (rows.length > 0) {
      await db.insert(leagueTranslations).values(rows)
    }
  }

  setResponseStatus(event, 201)
  return league
})
