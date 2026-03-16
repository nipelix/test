import { eq, and, inArray } from 'drizzle-orm'
import {
  sportTranslations, countryTranslations, leagueTranslations,
  marketTypeTranslations, selectionTemplateTranslations, bettingGroupTranslations,
  languages
} from '../../database/schema'

const entityTableMap = {
  SPORT: { table: sportTranslations, entityCol: 'sportId' as const },
  COUNTRY: { table: countryTranslations, entityCol: 'countryId' as const },
  LEAGUE: { table: leagueTranslations, entityCol: 'leagueId' as const },
  MARKET_TYPE: { table: marketTypeTranslations, entityCol: 'marketTypeId' as const },
  SELECTION_TEMPLATE: { table: selectionTemplateTranslations, entityCol: 'selectionTemplateId' as const },
  BETTING_GROUP: { table: bettingGroupTranslations, entityCol: 'bettingGroupId' as const }
} as const

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const entityType = query.entityType as string | undefined
  const entityId = query.entityId as string | undefined
  const lang = query.lang as string | undefined

  if (!entityType || !entityTableMap[entityType as keyof typeof entityTableMap]) {
    throw createError({ statusCode: 400, statusMessage: 'entityType is required and must be one of: SPORT, COUNTRY, LEAGUE, MARKET_TYPE, SELECTION_TEMPLATE, BETTING_GROUP' })
  }

  const db = useDb()
  const { table, entityCol } = entityTableMap[entityType as keyof typeof entityTableMap]

  const conditions: any[] = []
  if (entityId) conditions.push(eq((table as any)[entityCol], Number(entityId)))

  // Resolve lang code to ID
  if (lang) {
    const [langRow] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, lang))
    if (langRow) {
      conditions.push(eq((table as any).languageId, langRow.id))
    } else {
      return { data: [] }
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const data = await db.select({
    id: (table as any).id,
    entityId: (table as any)[entityCol],
    languageId: (table as any).languageId,
    langCode: languages.code,
    field: (table as any).field,
    value: (table as any).value,
    createdAt: (table as any).createdAt,
    updatedAt: (table as any).updatedAt
  }).from(table)
    .innerJoin(languages, eq((table as any).languageId, languages.id))
    .where(where)
    .orderBy((table as any)[entityCol], languages.code)

  return { data }
})
