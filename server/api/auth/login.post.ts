import { eq, and, isNull, or, gte } from 'drizzle-orm'
import { users, loginAttempts } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)
  const db = useDb()
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

  // Check recent failed attempts
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000)
  const failedAttempts = await db.select()
    .from(loginAttempts)
    .where(and(
      eq(loginAttempts.identifier, body.identifier),
      eq(loginAttempts.success, false),
      gte(loginAttempts.createdAt, fifteenMinAgo)
    ))

  if (failedAttempts.length >= 5) {
    throw createError({ statusCode: 429, statusMessage: 'Too many failed attempts. Please try again later.' })
  }

  // Find user by username OR email
  const user = await db.select()
    .from(users)
    .where(and(
      or(
        eq(users.username, body.identifier),
        eq(users.email, body.identifier)
      ),
      isNull(users.deletedAt)
    ))
    .limit(1)
    .then(rows => rows[0])

  if (!user) {
    // Dummy hash to prevent timing attacks
    await hashPasswordArgon('dummy-password-to-prevent-timing')
    await db.insert(loginAttempts).values({
      identifier: body.identifier,
      ipAddress: ip,
      success: false
    })
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // Verify password
  const valid = await verifyPasswordArgon(user.passwordHash, body.password)
  if (!valid) {
    await db.insert(loginAttempts).values({
      identifier: body.identifier,
      ipAddress: ip,
      success: false
    })
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // Check user status
  if (user.status !== 'ACTIVE') {
    throw createError({ statusCode: 403, statusMessage: 'Account is not active' })
  }

  // Create session
  await createSession(event, {
    userId: user.id,
    role: user.role,
    parentId: user.parentId,
    impersonatorId: null,
    loginMethod: 'PASSWORD',
    ipAddress: ip,
    userAgent: getRequestHeader(event, 'user-agent') || ''
  })

  // Log successful attempt
  await db.insert(loginAttempts).values({
    identifier: body.identifier,
    ipAddress: ip,
    success: true
  })

  const { passwordHash: _, ...userData } = user
  return userData
})
