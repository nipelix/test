import { eq, and, sql } from 'drizzle-orm'
import { translations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])

  const query = getQuery(event)
  const entityType = query.entityType as string | undefined
  const entityId = query.entityId as string | undefined
  const lang = query.lang as string | undefined

  const db = useDb()
  const conditions = []

  if (entityType) conditions.push(eq(translations.entityType, entityType as any))
  if (entityId) conditions.push(eq(translations.entityId, Number(entityId)))
  if (lang) conditions.push(eq(translations.lang, lang))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const data = await db.select().from(translations).where(where).orderBy(translations.entityType, translations.entityId, translations.lang)

  return { data }
})
