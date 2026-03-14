import { eq, and, isNull } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const body = await readValidatedBody(event, impersonateSchema.parse)
  const db = useDb()

  // PLAYER and SUB_DEALER cannot impersonate
  if (session.role === 'PLAYER' || session.role === 'SUB_DEALER') {
    throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' })
  }

  // No nested impersonation
  if (session.impersonatorId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot impersonate while already impersonating' })
  }

  // Find target user
  const target = await db.select()
    .from(users)
    .where(and(
      eq(users.id, body.targetUserId),
      isNull(users.deletedAt)
    ))
    .limit(1)
    .then(rows => rows[0])

  if (!target || target.status !== 'ACTIVE') {
    throw createError({ statusCode: 404, statusMessage: 'User not found or not active' })
  }

  // Target must have lower privileges
  if (getRoleLevel(target.role) <= getRoleLevel(session.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot impersonate a user with equal or higher privileges' })
  }

  // Must be in subtree
  const inSubtree = await isDescendant(session.userId, body.targetUserId)
  if (!inSubtree) {
    throw createError({ statusCode: 403, statusMessage: 'User is not in your subtree' })
  }

  // Update session in Redis
  const redis = useRedis()
  const sessionId = event.context.sessionId!
  await redis.hset(`session:${sessionId}`, {
    userId: target.id,
    role: target.role,
    parentId: target.parentId || '',
    impersonatorId: session.userId
  })

  const { passwordHash: _, ...userData } = target
  return { ...userData, isImpersonating: true }
})
