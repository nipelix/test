import { eq, and } from 'drizzle-orm'
import { languages, uiTranslations } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale')
  if (!locale) throw createError({ statusCode: 400, statusMessage: 'Locale required' })

  const db = useDb()

  // Check if language is active in DB
  const [lang] = await db.select({ id: languages.id, active: languages.active })
    .from(languages)
    .where(eq(languages.code, locale))
    .limit(1)

  if (!lang || !lang.active) {
    throw createError({ statusCode: 404, statusMessage: `Language '${locale}' not found or inactive` })
  }

  // Get all UI overrides for this language
  const rows = await db.select({ key: uiTranslations.key, value: uiTranslations.value })
    .from(uiTranslations)
    .where(eq(uiTranslations.languageId, lang.id))

  if (rows.length === 0) return {}

  // Convert flat dot-notation keys to nested object
  const result: Record<string, any> = {}
  for (const row of rows) {
    const keys = row.key.split('.')
    let current = result
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]!] ??= {}
      current = current[keys[i]!]
    }
    current[keys[keys.length - 1]!] = row.value
  }

  return result
})
