import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'
import {
  sportTranslations, countryTranslations, leagueTranslations,
  marketTypeTranslations, selectionTemplateTranslations, bettingGroupTranslations,
  languages
} from '../../database/schema'

const schema = z.object({
  entityType: z.enum(['SPORT', 'COUNTRY', 'LEAGUE', 'MARKET_TYPE', 'SELECTION_TEMPLATE', 'BETTING_GROUP']),
  entityId: z.number().int().positive(),
  translations: z.array(z.object({
    lang: z.string().max(10),
    field: z.string().max(50),
    value: z.string().max(500)
  })).min(1)
})

const entityConfig = {
  SPORT: { table: sportTranslations, entityCol: 'sportId' as const },
  COUNTRY: { table: countryTranslations, entityCol: 'countryId' as const },
  LEAGUE: { table: leagueTranslations, entityCol: 'leagueId' as const },
  MARKET_TYPE: { table: marketTypeTranslations, entityCol: 'marketTypeId' as const },
  SELECTION_TEMPLATE: { table: selectionTemplateTranslations, entityCol: 'selectionTemplateId' as const },
  BETTING_GROUP: { table: bettingGroupTranslations, entityCol: 'bettingGroupId' as const }
} as const

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const body = await readValidatedBody(event, schema.parse)
  const db = useDb()

  const { table, entityCol } = entityConfig[body.entityType]

  // Resolve language codes to IDs
  const langCodes = [...new Set(body.translations.map(t => t.lang))]
  const langRows = await db.select({ id: languages.id, code: languages.code })
    .from(languages)
    .where(inArray(languages.code, langCodes))
  const langMap: Record<string, number> = {}
  for (const l of langRows) langMap[l.code] = l.id

  const results = []
  for (const tr of body.translations) {
    const languageId = langMap[tr.lang]
    if (!languageId) continue

    const values: Record<string, any> = {
      [entityCol]: body.entityId,
      languageId,
      field: tr.field,
      value: tr.value
    }

    const [result] = await db.insert(table).values(values as any).onConflictDoUpdate({
      target: [(table as any)[entityCol], table.languageId, table.field],
      set: { value: tr.value, updatedAt: new Date() }
    }).returning()
    results.push(result)
  }

  setResponseStatus(event, 201)
  return { data: results }
})
