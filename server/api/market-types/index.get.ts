import { eq, and, sql, inArray, like, asc, desc } from 'drizzle-orm'
import { marketTypes, sports, bettingGroups, marketTypeTranslations, languages, marketTypeProviderMappings, providers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const active = query.active as string | undefined
  const sportId = query.sportId as string | undefined
  const bettingGroupId = query.bettingGroupId as string | undefined
  const search = query.search as string | undefined
  const lang = query.lang as string | undefined
  const include = (query.include as string || '').split(',').filter(Boolean)
  const sortByParam = query.sortBy as string | undefined
  const sortDirectionParam = query.sortDirection as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50))
  const offset = (page - 1) * limit

  const db = useDb()
  const conditions = []

  if (active !== undefined) conditions.push(eq(marketTypes.active, active === 'true'))
  if (sportId) conditions.push(eq(marketTypes.sportId, sportId))
  if (bettingGroupId) conditions.push(eq(marketTypes.bettingGroupId, bettingGroupId))
  if (search) conditions.push(like(marketTypes.name, `%${search}%`))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  // Sort
  const sortWhitelist: Record<string, any> = {
    name: marketTypes.name,
    sortOrder: marketTypes.sortOrder,
    active: marketTypes.active,
    selectionsCount: marketTypes.selectionsCount,
    createdAt: marketTypes.createdAt
  }
  const sortKeys = (sortByParam ?? 'sortOrder').split(',')
  const sortDirs = (sortDirectionParam ?? 'asc').split(',')
  const orderClauses = sortKeys
    .map((key, i) => {
      const col = sortWhitelist[key.trim()]
      if (!col) return null
      const dir = sortDirs[i]?.trim() === 'desc' ? desc : asc
      return dir(col)
    })
    .filter(Boolean)
  if (orderClauses.length === 0) orderClauses.push(asc(marketTypes.sortOrder))

  const [data, countResult] = await Promise.all([
    db.select({
      id: marketTypes.id,
      name: marketTypes.name,
      slug: marketTypes.slug,
      sportId: marketTypes.sportId,
      sportSlug: sports.slug,
      bettingGroupId: marketTypes.bettingGroupId,
      bettingGroupName: bettingGroups.name,
      category: marketTypes.category,
      extendsControl: marketTypes.extendsControl,
      providerFeedType: marketTypes.providerFeedType,
      selectionsCount: marketTypes.selectionsCount,
      active: marketTypes.active,
      sortOrder: marketTypes.sortOrder,
      createdAt: marketTypes.createdAt,
      updatedAt: marketTypes.updatedAt
    })
      .from(marketTypes)
      .leftJoin(sports, eq(marketTypes.sportId, sports.id))
      .leftJoin(bettingGroups, eq(marketTypes.bettingGroupId, bettingGroups.id))
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(...orderClauses),
    db.select({ count: sql<number>`count(*)::int` }).from(marketTypes).where(where)
  ])

  let result: any[] = data

  if (data.length > 0) {
    const ids = data.map(d => d.id)
    const langCodes = lang ? lang.split(',').map(l => l.trim()).filter(Boolean) : []

    let langIds: number[] = []
    if (langCodes.length > 0) {
      const langRows = await db.select({ id: languages.id, code: languages.code })
        .from(languages)
        .where(inArray(languages.code, langCodes))
      langIds = langRows.map(l => l.id)
    }

    const [transData, mappingsData] = await Promise.all([
      langIds.length > 0
        ? db.select({
            marketTypeId: marketTypeTranslations.marketTypeId,
            languageId: marketTypeTranslations.languageId,
            langCode: languages.code,
            field: marketTypeTranslations.field,
            value: marketTypeTranslations.value
          }).from(marketTypeTranslations)
            .innerJoin(languages, eq(marketTypeTranslations.languageId, languages.id))
            .where(and(
              inArray(marketTypeTranslations.marketTypeId, ids),
              inArray(marketTypeTranslations.languageId, langIds)
            ))
        : [],
      include.includes('providers')
        ? db.select({
            id: marketTypeProviderMappings.id,
            providerId: marketTypeProviderMappings.providerId,
            providerName: providers.name,
            providerSlug: providers.slug,
            entityId: marketTypeProviderMappings.marketTypeId,
            externalId: marketTypeProviderMappings.externalId
          }).from(marketTypeProviderMappings)
            .leftJoin(providers, eq(marketTypeProviderMappings.providerId, providers.id))
            .where(and(inArray(marketTypeProviderMappings.marketTypeId, ids)))
        : []
    ])

    if (langIds.length > 0 || include.includes('providers')) {
      const transMap = new Map<number, any[]>()
      for (const t of transData) {
        if (!transMap.has(t.marketTypeId)) transMap.set(t.marketTypeId, [])
        transMap.get(t.marketTypeId)!.push(t)
      }

      const mappingsMap = new Map<number, any[]>()
      for (const m of mappingsData) {
        if (!mappingsMap.has(m.marketTypeId)) mappingsMap.set(m.marketTypeId, [])
        mappingsMap.get(m.marketTypeId)!.push(m)
      }

      const isSingleLang = langCodes.length === 1

      result = data.map(d => {
        const trans = transMap.get(d.id) || []
        const extra: Record<string, any> = {}

        if (langIds.length > 0) {
          if (isSingleLang) {
            const t = trans.find(t => t.field === 'name')
            if (t) extra.displayName = t.value
          } else {
            extra.translations = trans
          }
        }

        if (include.includes('providers')) {
          extra.marketTypeProviderMappings = mappingsMap.get(d.id) || []
        }

        return { ...d, ...extra }
      })
    }
  }

  return { data: result, total: countResult[0]?.count || 0, page, limit }
})
