import { eq, and, sql, inArray } from 'drizzle-orm'
import { selectionTemplates, marketTypes, selectionTemplateTranslations, languages } from '../../database/schema'

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
      name: selectionTemplates.name,
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
  const langCodes = lang ? lang.split(',').map(l => l.trim()).filter(Boolean) : []

  if (langCodes.length > 0 && data.length > 0) {
    const ids = data.map(d => d.id)

    const langRows = await db.select({ id: languages.id, code: languages.code })
      .from(languages)
      .where(inArray(languages.code, langCodes))
    const langIds = langRows.map(l => l.id)

    if (langIds.length > 0) {
      const trans = await db.select({
        selectionTemplateId: selectionTemplateTranslations.selectionTemplateId,
        languageId: selectionTemplateTranslations.languageId,
        langCode: languages.code,
        field: selectionTemplateTranslations.field,
        value: selectionTemplateTranslations.value
      }).from(selectionTemplateTranslations)
        .innerJoin(languages, eq(selectionTemplateTranslations.languageId, languages.id))
        .where(and(
          inArray(selectionTemplateTranslations.selectionTemplateId, ids),
          inArray(selectionTemplateTranslations.languageId, langIds)
        ))

      const transMap = new Map<number, typeof trans>()
      for (const t of trans) {
        if (!transMap.has(t.selectionTemplateId)) transMap.set(t.selectionTemplateId, [])
        transMap.get(t.selectionTemplateId)!.push(t)
      }

      const isSingleLang = langCodes.length === 1

      result = data.map(d => {
        const dTrans = transMap.get(d.id) || []
        if (isSingleLang) {
          const t = dTrans.find(t => t.field === 'name')
          return { ...d, displayName: t?.value || d.name }
        }
        return { ...d, translations: dTrans }
      })
    }
  }

  return { data: result, total: countResult[0]?.count || 0, page, limit }
})
