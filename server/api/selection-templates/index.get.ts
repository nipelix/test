import { eq, and, sql, inArray } from 'drizzle-orm'
import { selectionTemplates, marketTypes, translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const marketGroupId = query.marketGroupId as string | undefined
  const active = query.active as string | undefined
  const lang = query.lang as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50))
  const offset = (page - 1) * limit

  const db = useDb()
  const conditions = []

  if (marketGroupId) conditions.push(eq(selectionTemplates.marketGroupId, Number(marketGroupId)))
  if (active !== undefined) conditions.push(eq(selectionTemplates.active, active === 'true'))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, countResult] = await Promise.all([
    db.select({
      id: selectionTemplates.id,
      groupId: selectionTemplates.groupId,
      marketGroupId: selectionTemplates.marketGroupId,
      marketGroupName: marketTypes.name,
      sortOrder: selectionTemplates.sortOrder,
      active: selectionTemplates.active,
      statusType: selectionTemplates.statusType,
      validator: selectionTemplates.validator,
      drawNoBet: selectionTemplates.drawNoBet,
      period: selectionTemplates.period,
      providerFeedType: selectionTemplates.providerFeedType,
      createdAt: selectionTemplates.createdAt,
      updatedAt: selectionTemplates.updatedAt
    })
      .from(selectionTemplates)
      .leftJoin(marketTypes, eq(selectionTemplates.marketGroupId, marketTypes.id))
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(selectionTemplates.sortOrder),
    db.select({ count: sql<number>`count(*)::int` }).from(selectionTemplates).where(where)
  ])

  let result: any[] = data
  const langs = lang ? lang.split(',').map(l => l.trim()).filter(Boolean) : []

  if (langs.length > 0 && data.length > 0) {
    const ids = data.map(d => d.id)
    const trans = await db.select().from(translations)
      .where(and(
        eq(translations.entityType, 'SELECTION_TEMPLATE'),
        inArray(translations.entityId, ids),
        inArray(translations.lang, langs)
      ))

    const transMap = new Map<number, typeof trans>()
    for (const t of trans) {
      if (!transMap.has(t.entityId)) transMap.set(t.entityId, [])
      transMap.get(t.entityId)!.push(t)
    }

    const isSingleLang = langs.length === 1

    result = data.map(d => {
      const dTrans = transMap.get(d.id) || []
      if (isSingleLang) {
        const t = dTrans.find(t => t.field === 'name')
        return { ...d, name: t?.value || d.marketGroupName }
      }
      return { ...d, translations: dTrans }
    })
  }

  return { data: result, total: countResult[0]?.count || 0, page, limit }
})
