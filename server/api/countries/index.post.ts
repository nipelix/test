import { countries, translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createCountrySchema.parse)
  const db = useDb()

  const [country] = await db.insert(countries).values({
    name: body.name,
    code: body.code,
    slug: body.slug || null,
    flag: body.flag || null,
    active: body.active
  }).returning()

  if (body.translations?.length) {
    await db.insert(translations).values(
      body.translations.map(t => ({
        entityType: 'COUNTRY' as const,
        entityId: country.id,
        lang: t.lang,
        field: t.field,
        value: t.value
      }))
    )
  }

  setResponseStatus(event, 201)
  return country
})
