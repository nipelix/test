import { eq, and, isNull } from 'drizzle-orm'
import { users } from '~~/server/database/schema'
import { createUserSchema } from '~~/server/utils/validation'
import { ROLE_WALLET_TYPE, canCreateRole, isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const body = await readValidatedBody(event, createUserSchema.parse)
  const db = useDb()

  // Verify permission
  if (!isRole(session.role) || !canCreateRole(session.role, body.role as Role)) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot create this role' })
  }

  // Resolve parentId
  let parentId: number | null = null
  if (body.parentId) {
    await requireTreeAccess(event, body.parentId)
    parentId = body.parentId
  } else {
    parentId = session.userId
  }

  // Determine wallet type
  const targetRole = body.role as Role
  const walletType = body.walletType || ROLE_WALLET_TYPE[targetRole]

  // Hash password
  const passwordHash = await hashPasswordArgon(body.password)

  // Atomic: create user + tree + wallet in single transaction
  const newUser = await db.transaction(async (tx) => {
    // Check username uniqueness inside transaction
    const [existing] = await tx.select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, body.username), isNull(users.deletedAt)))
      .limit(1)

    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'Username already taken' })
    }

    // Insert user
    const [created] = await tx.insert(users).values({
      username: body.username,
      email: body.email,
      passwordHash,
      role: targetRole,
      parentId,
      status: 'ACTIVE',
      walletType
    }).returning()

    if (!created) throw createError({ statusCode: 500, statusMessage: 'Failed to create user' })

    return created
  })

  // Tree and wallet
  await addUserToTree(newUser.id, parentId)
  const wallet = await createWallet(newUser.id)

  // Set initial balance if provided (does NOT deduct from creator)
  if (body.initialBalance && body.initialBalance > 0 && wallet) {
    await executeTransaction({
      type: 'DEPOSIT',
      walletId: wallet.id,
      direction: 'CREDIT',
      amount: body.initialBalance,
      idempotencyKey: `initial:${newUser.id}`,
      referenceType: 'INITIAL',
      description: `Initial balance for ${newUser.username}`,
      createdBy: session.userId
    })
  }

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
