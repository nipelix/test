import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const db = useDb()

  const user = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    role: users.role,
    parentId: users.parentId,
    status: users.status,
    walletType: users.walletType,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    preferences: users.preferences
  })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)
    .then(rows => rows[0])

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return {
    ...user,
    isImpersonating: !!session.impersonatorId
  }
})
