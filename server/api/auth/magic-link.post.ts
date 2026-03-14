import { randomBytes, createHash } from 'node:crypto'
import { eq, and, isNull } from 'drizzle-orm'
import { users, magicLinks } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, magicLinkSchema.parse)
  const db = useDb()
  const redis = useRedis()

  // Rate limit: 3 requests per 15 minutes per email
  const rateLimitKey = `magic-link:${body.email}`
  const count = await redis.incr(rateLimitKey)
  if (count === 1) await redis.expire(rateLimitKey, 900)
  if (count > 3) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  // Find user (don't reveal if exists)
  const user = await db.select()
    .from(users)
    .where(and(
      eq(users.email, body.email),
      isNull(users.deletedAt)
    ))
    .limit(1)
    .then(rows => rows[0])

  if (user) {
    // Generate token
    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await db.insert(magicLinks).values({
      userId: user.id,
      tokenHash,
      expiresAt
    })

    // In production, send via email. For now, log it.
    console.log(`[Magic Link] Token for ${body.email}: ${token}`)
  }

  return { message: 'If the email exists, a link has been sent.' }
})
