import { eq, and, isNull } from 'drizzle-orm'
import { users } from '~~/server/database/schema'
import { isRoleAbove, isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  if (id === session.userId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete yourself' })
  }

  const db = useDb()
  await requireTreeAccess(event, id)

  const [target] = await db.select({ role: users.role })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1)

  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  if (!isRole(session.role) || !isRole(target.role) || !isRoleAbove(session.role, target.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot delete a user of equal or higher role' })
  }

  await db.update(users)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, id))

  return { success: true }
})
