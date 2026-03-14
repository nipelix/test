import { z } from 'zod'
import { eq, and, desc, sql, ilike } from 'drizzle-orm'
import { activityLogs, users } from '~~/server/database/schema'

const querySchema = z.object({
  action: z.string().max(100).optional(),
  userId: z.coerce.number().int().positive().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50)
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = useDb()

  const conditions = []
  if (query.action) conditions.push(eq(activityLogs.action, query.action))
  if (query.userId) conditions.push(eq(activityLogs.userId, query.userId))
  if (query.search) conditions.push(ilike(activityLogs.action, `%${query.search}%`))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [countResult] = await db.select({ count: sql<number>`count(*)` })
    .from(activityLogs)
    .where(where)

  const total = Number(countResult?.count ?? 0)
  const offset = (query.page - 1) * query.limit

  const rows = await db.select({
    id: activityLogs.id,
    userId: activityLogs.userId,
    username: users.username,
    action: activityLogs.action,
    entityType: activityLogs.entityType,
    entityId: activityLogs.entityId,
    details: activityLogs.details,
    ipAddress: activityLogs.ipAddress,
    createdAt: activityLogs.createdAt
  })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(where)
    .orderBy(desc(activityLogs.createdAt))
    .limit(query.limit)
    .offset(offset)

  return { data: rows, total, page: query.page, limit: query.limit }
})
