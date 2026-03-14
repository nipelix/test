import { createHash } from 'node:crypto'
import { eq, and, isNull, gt } from 'drizzle-orm'
import { users, magicLinks } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, verifyLinkSchema.parse)
  const db = useDb()

  const tokenHash = createHash('sha256').update(body.token).digest('hex')

  const link = await db.select()
    .from(magicLinks)
    .where(and(
      eq(magicLinks.tokenHash, tokenHash),
      isNull(magicLinks.usedAt),
      gt(magicLinks.expiresAt, new Date())
    ))
    .limit(1)
    .then(rows => rows[0])

  if (!link) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired link' })
  }

  // Mark as used
  await db.update(magicLinks)
    .set({ usedAt: new Date() })
    .where(eq(magicLinks.id, link.id))

  // Get user
  const user = await db.select()
    .from(users)
    .where(eq(users.id, link.userId))
    .limit(1)
    .then(rows => rows[0])

  if (!user || user.status !== 'ACTIVE') {
    throw createError({ statusCode: 403, statusMessage: 'Account is not active' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  await createSession(event, {
    userId: user.id,
    role: user.role,
    parentId: user.parentId,
    impersonatorId: null,
    loginMethod: 'MAGIC_LINK',
    ipAddress: ip,
    userAgent: getRequestHeader(event, 'user-agent') || ''
  })

  const { passwordHash: _, ...userData } = user
  return userData
})
