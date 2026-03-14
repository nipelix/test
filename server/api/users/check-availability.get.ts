import { z } from 'zod'
import { eq, and, isNull, ne } from 'drizzle-orm'
import { users } from '~~/server/database/schema'

const querySchema = z.object({
  username: z.string().min(1).max(50).optional(),
  email: z.string().email().max(255).optional(),
  excludeId: z.coerce.number().int().positive().optional()
})

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = useDb()

  const result: Record<string, boolean> = {}

  if (query.username) {
    const conditions = [eq(users.username, query.username), isNull(users.deletedAt)]
    if (query.excludeId) conditions.push(ne(users.id, query.excludeId))

    const [existing] = await db.select({ id: users.id })
      .from(users)
      .where(and(...conditions))
      .limit(1)

    result.usernameAvailable = !existing
  }

  if (query.email) {
    const conditions = [eq(users.email, query.email), isNull(users.deletedAt)]
    if (query.excludeId) conditions.push(ne(users.id, query.excludeId))

    const [existing] = await db.select({ id: users.id })
      .from(users)
      .where(and(...conditions))
      .limit(1)

    result.emailAvailable = !existing
  }

  return result
})
