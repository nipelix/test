import { inArray } from 'drizzle-orm'
import { countries, countryTranslations, languages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createCountrySchema.parse)
  const db = useDb()

  const [country] = await db.insert(countries).values({
    code: body.code,
    slug: body.slug || null,
    flag: body.flag || null,
    active: body.active
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
        countryId: country.id,
        languageId: langMap[t.lang],
        field: t.field,
        value: t.value
      }))

    if (rows.length > 0) {
      await db.insert(countryTranslations).values(rows)
    }
  }

  setResponseStatus(event, 201)
  return country
})
