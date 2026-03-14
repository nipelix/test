import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  if (!session.impersonatorId) {
    throw createError({ statusCode: 400, statusMessage: 'Not currently impersonating' })
  }

  const db = useDb()
  const impersonator = await db.select()
    .from(users)
    .where(eq(users.id, session.impersonatorId))
    .limit(1)
    .then(rows => rows[0])

  if (!impersonator) {
    throw createError({ statusCode: 404, statusMessage: 'Impersonator user not found' })
  }

  // Update session in Redis
  const redis = useRedis()
  const sessionId = event.context.sessionId!
  await redis.hset(`session:${sessionId}`, {
    userId: impersonator.id,
    role: impersonator.role,
    parentId: impersonator.parentId || '',
    impersonatorId: ''
  })

  const { passwordHash: _, ...userData } = impersonator
  return { ...userData, isImpersonating: false }
})
