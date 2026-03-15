import { z } from 'zod'
import { eq, and, isNull, ilike, sql, desc, asc } from 'drizzle-orm'
import { users, wallets, userTree } from '~~/server/database/schema'
import { ROLES } from '~~/shared/types/roles'

const SORTABLE_COLUMNS = ['id', 'username', 'email', 'role', 'status', 'createdAt'] as const

const querySchema = z.object({
  role: z.enum(ROLES).optional(),
  status: z.enum(['ACTIVE', 'PASSIVE']).optional(),
  parentId: z.coerce.number().int().positive().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(SORTABLE_COLUMNS).optional().default('id'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(20)
})

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = useDb()

  // Build conditions
  const conditions = [isNull(users.deletedAt)]

  if (query.role) conditions.push(eq(users.role, query.role))
  if (query.status) conditions.push(eq(users.status, query.status))
  if (query.search) {
    const escaped = query.search.replace(/[%_\\]/g, '\\$&')
    conditions.push(ilike(users.username, `%${escaped}%`))
  }

  // Scope by hierarchy
  if (session.role !== 'SUPER_ADMIN') {
    if (query.parentId) {
      const hasAccess = await isDescendant(session.userId, query.parentId)
      if (!hasAccess && session.userId !== query.parentId) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied' })
      }
      conditions.push(eq(users.parentId, query.parentId))
    } else {
      // Use SQL subquery instead of materializing all descendant IDs
      conditions.push(
        sql`${users.id} IN (SELECT descendant_id FROM user_tree WHERE ancestor_id = ${session.userId})`
      )
    }
  } else if (query.parentId) {
    conditions.push(eq(users.parentId, query.parentId))
  }

  const where = and(...conditions)

  // Count (no JOIN needed)
  const [countResult] = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(where)

  const total = Number(countResult?.count ?? 0)

  // Sort
  const sortColumnMap: Record<string, any> = {
    id: users.id,
    username: users.username,
    email: users.email,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt
  }
  const sortColumn = sortColumnMap[query.sortBy] ?? users.id
  const orderFn = query.sortDirection === 'asc' ? asc : desc

  // Fetch with wallet join
  const offset = (query.page - 1) * query.limit
  const rows = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    role: users.role,
    parentId: users.parentId,
    status: users.status,
    walletType: users.walletType,
    createdAt: users.createdAt,
    balance: wallets.balance
  })
    .from(users)
    .leftJoin(wallets, eq(users.id, wallets.userId))
    .where(where)
    .orderBy(orderFn(sortColumn))
    .limit(query.limit)
    .offset(offset)

  return { data: rows, total, page: query.page, limit: query.limit }
})
