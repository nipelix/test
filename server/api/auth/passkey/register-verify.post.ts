import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { passkeys } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const config = useRuntimeConfig()
  const db = useDb()
  const redis = useRedis()

  const body = await readBody(event)

  // Get stored challenge
  const expectedChallenge = await redis.get(`webauthn:register:${session.userId}`)
  if (!expectedChallenge) {
    throw createError({ statusCode: 400, statusMessage: 'Registration challenge expired' })
  }

  const verification = await verifyRegistrationResponse({
    response: body.credential,
    expectedChallenge,
    expectedOrigin: config.webauthnOrigin,
    expectedRPID: config.webauthnRpId
  })

  if (!verification.verified || !verification.registrationInfo) {
    throw createError({ statusCode: 400, statusMessage: 'Verification failed' })
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

  // Store credential - id is already base64url string, publicKey is Uint8Array
  await db.insert(passkeys).values({
    userId: session.userId,
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    transports: body.credential.response.transports
      ? JSON.stringify(body.credential.response.transports)
      : null,
    name: body.name || null
  })

  // Clean up challenge
  await redis.del(`webauthn:register:${session.userId}`)

  return { ok: true }
})
