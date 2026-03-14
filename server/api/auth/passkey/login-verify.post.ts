import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { eq } from 'drizzle-orm'
import { passkeys, users } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = useDb()
  const redis = useRedis()

  const body = await readBody(event)
  const { credential, challengeId } = body

  if (!challengeId || !credential) {
    throw createError({ statusCode: 400, statusMessage: 'Missing credential or challengeId' })
  }

  // Get stored challenge
  const expectedChallenge = await redis.get(`webauthn:login:${challengeId}`)
  if (!expectedChallenge) {
    throw createError({ statusCode: 400, statusMessage: 'Challenge expired' })
  }

  // Find passkey by credential ID
  const credentialIdB64 = credential.id
  const passkey = await db.select()
    .from(passkeys)
    .where(eq(passkeys.credentialId, credentialIdB64))
    .limit(1)
    .then(rows => rows[0])

  if (!passkey) {
    throw createError({ statusCode: 401, statusMessage: 'Passkey not found' })
  }

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: config.webauthnOrigin,
    expectedRPID: config.webauthnRpId,
    credential: {
      id: passkey.credentialId,
      publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64url')),
      counter: passkey.counter,
      transports: passkey.transports ? JSON.parse(passkey.transports) : undefined
    }
  })

  if (!verification.verified) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication failed' })
  }

  // Update counter
  await db.update(passkeys)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(passkeys.id, passkey.id))

  // Get user
  const user = await db.select()
    .from(users)
    .where(eq(users.id, passkey.userId))
    .limit(1)
    .then(rows => rows[0])

  if (!user || user.status !== 'ACTIVE') {
    throw createError({ statusCode: 403, statusMessage: 'Account is not active' })
  }

  // Create session
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  await createSession(event, {
    userId: user.id,
    role: user.role,
    parentId: user.parentId,
    impersonatorId: null,
    loginMethod: 'PASSKEY',
    ipAddress: ip,
    userAgent: getRequestHeader(event, 'user-agent') || ''
  })

  // Clean up
  await redis.del(`webauthn:login:${challengeId}`)

  const { passwordHash: _, ...userData } = user
  return userData
})
