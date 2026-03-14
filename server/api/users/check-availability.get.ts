import { z } from 'zod'
import { eq, and, isNull, ne } from 'drizzle-orm'
import { users } from '~~/server/database/schema'

const querySchema = z.object({
  username: z.string().min(1).max(50).optional(),
  email: z.string().email().max(255).optional(),
  excludeId: z.coerce.number().int().positive().optional()
})

async function checkField(
  db: ReturnType<typeof useDb>,
  field: typeof users.username | typeof users.email,
  value: string,
  excludeId?: number
): Promise<boolean> {
  const conditions = [eq(field, value), isNull(users.deletedAt)]
  if (excludeId) conditions.push(ne(users.id, excludeId))
  const [existing] = await db.select({ id: users.id })
    .from(users)
    .where(and(...conditions))
    .limit(1)
  return !existing
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = useDb()

  const [usernameAvailable, emailAvailable] = await Promise.all([
    query.username ? checkField(db, users.username, query.username, query.excludeId) : undefined,
    query.email ? checkField(db, users.email, query.email, query.excludeId) : undefined
  ])

  const result: Record<string, boolean> = {}
  if (usernameAvailable !== undefined) result.usernameAvailable = usernameAvailable
  if (emailAvailable !== undefined) result.emailAvailable = emailAvailable

  return result
})
