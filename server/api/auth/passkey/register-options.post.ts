import { generateRegistrationOptions } from '@simplewebauthn/server'
import { eq } from 'drizzle-orm'
import { passkeys } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const config = useRuntimeConfig()
  const db = useDb()
  const redis = useRedis()

  // Get existing passkeys for this user
  const existingKeys = await db.select({
    credentialId: passkeys.credentialId,
    transports: passkeys.transports
  })
    .from(passkeys)
    .where(eq(passkeys.userId, session.userId))

  const excludeCredentials = existingKeys.map(key => ({
    id: key.credentialId,
    transports: key.transports ? JSON.parse(key.transports) : undefined
  }))

  const options = await generateRegistrationOptions({
    rpName: config.webauthnRpName,
    rpID: config.webauthnRpId,
    userName: String(session.userId),
    attestationType: 'none',
    excludeCredentials,
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred'
    }
  })

  // Store challenge in Redis (5 min TTL)
  await redis.set(`webauthn:register:${session.userId}`, options.challenge, 'EX', 300)

  return options
})
