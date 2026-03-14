import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users } from '~~/server/database/schema'

const schema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(4).max(128)
})

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const body = await readValidatedBody(event, schema.parse)
  const db = useDb()

  const [user] = await db.select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const valid = await verifyPasswordArgon(user.passwordHash, body.oldPassword)
  if (!valid) throw createError({ statusCode: 400, statusMessage: 'Invalid current password' })

  const newHash = await hashPasswordArgon(body.newPassword)
  await db.update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, session.userId))

  return { success: true }
})
