import { eq, and, isNull, ne } from 'drizzle-orm'
import { users } from '~~/server/database/schema'
import { updateUserSchema } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readValidatedBody(event, updateUserSchema.parse)
  const db = useDb()

  // Verify access
  await requireTreeAccess(event, id)

  // If username is changing, check uniqueness
  if (body.username) {
    const [existing] = await db.select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.username, body.username),
        ne(users.id, id),
        isNull(users.deletedAt)
      ))
      .limit(1)

    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'Username already taken' })
    }
  }

  // If parentId is changing, verify access to new parent
  if (body.parentId) {
    await requireTreeAccess(event, body.parentId)
  }

  // Build update
  const update: Record<string, any> = { updatedAt: new Date() }
  if (body.username) update.username = body.username
  if (body.email) update.email = body.email
  if (body.status) update.status = body.status
  if (body.walletType) update.walletType = body.walletType
  if (body.parentId) update.parentId = body.parentId

  const [updated] = await db.update(users)
    .set(update)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  // If parentId changed, update tree
  if (body.parentId) {
    await moveUserInTree(id, body.parentId)
  }

  return {
    id: updated.id,
    username: updated.username,
    email: updated.email,
    role: updated.role,
    parentId: updated.parentId,
    status: updated.status,
    walletType: updated.walletType,
    updatedAt: updated.updatedAt
  }
})
