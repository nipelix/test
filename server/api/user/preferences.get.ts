import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const db = useDb()

  const row = await db.select({ preferences: users.preferences })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)
    .then(rows => rows[0])

  return (row?.preferences as Record<string, any>) ?? {}
})
