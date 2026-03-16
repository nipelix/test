import { eq, and, sql, inArray, asc, desc } from 'drizzle-orm'
import { sports, sportTranslations, languages, providerMappings, providers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const active = query.active as string | undefined
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

  if (active !== undefined) conditions.push(eq(sports.active, active === 'true'))

  // For search, we search in sportTranslations (name field) instead of sports.name
  // Search is handled after fetching translations below

  const where = conditions.length > 0 ? and(...conditions) : undefined

  // Sort
  const sortWhitelist: Record<string, any> = {
    sortOrder: sports.sortOrder,
    active: sports.active,
    createdAt: sports.createdAt
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
  if (orderClauses.length === 0) orderClauses.push(asc(sports.sortOrder))

  const [data, countResult] = await Promise.all([
    db.select().from(sports).where(where).limit(limit).offset(offset).orderBy(...orderClauses),
    db.select({ count: sql<number>`count(*)::int` }).from(sports).where(where)
  ])

  let result: any[] = data

  if (data.length > 0) {
    const ids = data.map(d => d.id)
    const langCodes = lang ? lang.split(',').map(l => l.trim()).filter(Boolean) : []

    // Resolve language IDs from codes
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
            sportId: sportTranslations.sportId,
            languageId: sportTranslations.languageId,
            langCode: languages.code,
            field: sportTranslations.field,
            value: sportTranslations.value
          }).from(sportTranslations)
            .innerJoin(languages, eq(sportTranslations.languageId, languages.id))
            .where(and(
              inArray(sportTranslations.sportId, ids),
              inArray(sportTranslations.languageId, langIds)
            ))
        : [],
      include.includes('providers')
        ? db.select({
            id: providerMappings.id,
            providerId: providerMappings.providerId,
            providerName: providers.name,
            providerSlug: providers.slug,
            entityId: providerMappings.entityId,
            externalId: providerMappings.externalId
          }).from(providerMappings)
            .leftJoin(providers, eq(providerMappings.providerId, providers.id))
            .where(and(eq(providerMappings.entityType, 'SPORT'), inArray(providerMappings.entityId, ids)))
        : []
    ])

    if (langIds.length > 0 || include.includes('providers')) {
      const transMap = new Map<number, any[]>()
      for (const t of transData) {
        if (!transMap.has(t.sportId)) transMap.set(t.sportId, [])
        transMap.get(t.sportId)!.push(t)
      }

      const mappingsMap = new Map<number, any[]>()
      for (const m of mappingsData) {
        if (!mappingsMap.has(m.entityId)) mappingsMap.set(m.entityId, [])
        mappingsMap.get(m.entityId)!.push(m)
      }

      const isSingleLang = langCodes.length === 1

      result = data.map(d => {
        const trans = transMap.get(d.id) || []
        const extra: Record<string, any> = {}

        if (langIds.length > 0) {
          if (isSingleLang) {
            const t = trans.find(t => t.field === 'name')
            extra.name = t?.value || d.slug
          } else {
            extra.translations = trans
          }
        }

        if (include.includes('providers')) {
          extra.providerMappings = mappingsMap.get(d.id) || []
        }

        return { ...d, ...extra }
      })
    }

    // Search filter (post-fetch, on resolved name)
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(r => {
        const name = r.name || r.slug || ''
        return name.toLowerCase().includes(searchLower)
      })
    }
  }

  return { data: result, total: countResult[0]?.count || 0, page, limit }
})
