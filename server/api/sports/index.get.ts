import { eq, and, sql, inArray, like, asc, desc } from 'drizzle-orm'
import { sports, translations, providerMappings, providers } from '../../database/schema'

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
  if (search) conditions.push(like(sports.name, `%${search}%`))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  // Sort
  const sortWhitelist: Record<string, any> = {
    name: sports.name,
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
    const langs = lang ? lang.split(',').map(l => l.trim()).filter(Boolean) : []

    const [transData, mappingsData] = await Promise.all([
      langs.length > 0
        ? db.select().from(translations).where(and(
            eq(translations.entityType, 'SPORT'),
            inArray(translations.entityId, ids),
            inArray(translations.lang, langs)
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

    if (langs.length > 0 || include.includes('providers')) {
      const transMap = new Map<number, any[]>()
      for (const t of transData) {
        if (!transMap.has(t.entityId)) transMap.set(t.entityId, [])
        transMap.get(t.entityId)!.push(t)
      }

      const mappingsMap = new Map<number, any[]>()
      for (const m of mappingsData) {
        if (!mappingsMap.has(m.entityId)) mappingsMap.set(m.entityId, [])
        mappingsMap.get(m.entityId)!.push(m)
      }

      const isSingleLang = langs.length === 1

      result = data.map(d => {
        const trans = transMap.get(d.id) || []
        const extra: Record<string, any> = {}

        if (langs.length > 0) {
          if (isSingleLang) {
            const t = trans.find(t => t.field === 'name')
            extra.name = t?.value || d.name
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
  }

  return { data: result, total: countResult[0]?.count || 0, page, limit }
})
