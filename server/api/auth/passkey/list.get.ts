import { eq } from 'drizzle-orm'
import { passkeys } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const db = useDb()

  const keys = await db.select({
    id: passkeys.id,
    name: passkeys.name,
    deviceType: passkeys.deviceType,
    backedUp: passkeys.backedUp,
    createdAt: passkeys.createdAt
  })
    .from(passkeys)
    .where(eq(passkeys.userId, session.userId))
    .orderBy(passkeys.createdAt)

  return keys
})
