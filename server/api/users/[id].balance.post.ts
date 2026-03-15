import { z } from 'zod'
import { canManageBalance, isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'
import { eq, and, isNull } from 'drizzle-orm'
import { users } from '~~/server/database/schema'

const balanceSchema = z.object({
  operation: z.enum(['add', 'remove']),
  amount: z.number().positive().max(10_000_000),
  description: z.string().max(500).optional()
})

const INVERSE_ADJUSTMENT_ROLES: Role[] = ['DEALER', 'PLAYER']

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readValidatedBody(event, balanceSchema.parse)
  const db = useDb()

  await requireTreeAccess(event, id)

  const [target] = await db.select({ role: users.role, parentId: users.parentId })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1)

  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  if (!isRole(session.role) || !isRole(target.role) || !canManageBalance(session.role, target.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot manage balance for this role' })
  }

  const targetWallet = await getWalletByUserId(id)
  if (!targetWallet) throw createError({ statusCode: 404, statusMessage: 'Target wallet not found' })

  const direction = body.operation === 'add' ? 'CREDIT' as const : 'DEBIT' as const
  const txType = body.operation === 'add' ? 'DEPOSIT' as const : 'WITHDRAWAL' as const
  const needsInverse = INVERSE_ADJUSTMENT_ROLES.includes(target.role as Role) && target.parentId != null

  // Deterministic idempotency key
  const idempotencyKey = `manual:${session.userId}:${id}:${txType}:${body.amount}:${Date.now()}`

  // Single atomic transaction for both operations
  const result = await db.transaction(async (tx) => {
    const targetResult = await executeTransaction({
      type: txType,
      walletId: targetWallet.id,
      direction,
      amount: body.amount,
      idempotencyKey: `${idempotencyKey}:target`,
      referenceType: 'MANUAL',
      description: body.description || `${body.operation} by ${session.role}`,
      createdBy: session.userId
    }, tx)

    if (needsInverse) {
      const parentWallet = await getWalletByUserId(target.parentId!)
      if (!parentWallet) {
        throw createError({ statusCode: 400, statusMessage: 'Parent wallet not found' })
      }

      const inverseDirection = body.operation === 'add' ? 'DEBIT' as const : 'CREDIT' as const
      await executeTransaction({
        type: txType,
        walletId: parentWallet.id,
        direction: inverseDirection,
        amount: body.amount,
        idempotencyKey: `${idempotencyKey}:parent`,
        referenceType: 'MANUAL',
        description: `Inverse: ${body.operation} to user ${id}`,
        createdBy: session.userId
      }, tx)
    }

    return targetResult
  })

  return result
})
