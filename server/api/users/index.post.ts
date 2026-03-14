import { eq, and, isNull } from 'drizzle-orm'
import { users } from '~~/server/database/schema'
import { createUserSchema } from '~~/server/utils/validation'
import { ROLE_WALLET_TYPE, canCreateRole, isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const body = await readValidatedBody(event, createUserSchema.parse)
  const db = useDb()

  const actorRole = session.role as Role
  const targetRole = body.role as Role

  // Verify permission to create this role
  if (!isRole(actorRole) || !canCreateRole(actorRole, targetRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot create this role' })
  }

  // Check username uniqueness
  const [existing] = await db.select({ id: users.id })
    .from(users)
    .where(and(eq(users.username, body.username), isNull(users.deletedAt)))
    .limit(1)

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Username already taken' })
  }

  // Resolve parentId
  let parentId: number | null = null
  if (body.parentId) {
    // Verify caller has access to the specified parent
    await requireTreeAccess(event, body.parentId)
    parentId = body.parentId
  } else {
    // Default parent is the creator
    parentId = session.userId
  }

  // Determine wallet type
  const walletType = body.walletType || ROLE_WALLET_TYPE[targetRole]

  // Hash password
  const passwordHash = await hashPasswordArgon(body.password)

  // Create user
  const [newUser] = await db.insert(users).values({
    username: body.username,
    email: body.email,
    passwordHash,
    role: targetRole,
    parentId,
    status: 'ACTIVE',
    walletType
  }).returning()

  if (!newUser) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create user' })
  }

  // Add to user tree
  await addUserToTree(newUser.id, parentId)

  // Create wallet
  await createWallet(newUser.id)

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    parentId: newUser.parentId,
    status: newUser.status,
    walletType: newUser.walletType,
    createdAt: newUser.createdAt
  }
})
