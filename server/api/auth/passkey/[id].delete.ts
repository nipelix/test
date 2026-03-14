import { eq, and } from 'drizzle-orm'
import { passkeys } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const deleted = await db.delete(passkeys)
    .where(and(
      eq(passkeys.id, id),
      eq(passkeys.userId, session.userId)
    ))
    .returning()

  if (deleted.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Passkey not found' })
  }

  return { ok: true }
})
