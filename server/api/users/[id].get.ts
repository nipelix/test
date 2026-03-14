import { eq, and, isNull } from 'drizzle-orm'
import { users, wallets } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  // Verify access
  await requireTreeAccess(event, id)

  const db = useDb()
  const [row] = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    role: users.role,
    parentId: users.parentId,
    status: users.status,
    walletType: users.walletType,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    balance: wallets.balance
  })
    .from(users)
    .leftJoin(wallets, eq(users.id, wallets.userId))
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1)

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return row
})
