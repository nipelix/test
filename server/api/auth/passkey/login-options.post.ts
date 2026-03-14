import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const redis = useRedis()

  const options = await generateAuthenticationOptions({
    rpID: config.webauthnRpId,
    userVerification: 'preferred'
  })

  // Store challenge with a temp ID (since user is not logged in yet)
  const challengeId = randomBytes(16).toString('hex')
  await redis.set(`webauthn:login:${challengeId}`, options.challenge, 'EX', 300)

  return { ...options, challengeId }
})
