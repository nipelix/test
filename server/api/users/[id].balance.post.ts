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

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readValidatedBody(event, balanceSchema.parse)
  const db = useDb()

  // Verify tree access
  await requireTreeAccess(event, id)

  // Fetch target role
  const [target] = await db.select({ role: users.role })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1)

  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  if (!isRole(session.role) || !isRole(target.role) || !canManageBalance(session.role as Role, target.role as Role)) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot manage balance for this role' })
  }

  // Fetch both wallets upfront
  const [targetWallet, senderWallet] = await Promise.all([
    getWalletByUserId(id),
    getWalletByUserId(session.userId)
  ])

  if (!targetWallet) throw createError({ statusCode: 404, statusMessage: 'Target wallet not found' })
  if (!senderWallet) throw createError({ statusCode: 400, statusMessage: 'Sender wallet not found' })

  const direction = body.operation === 'add' ? 'CREDIT' as const : 'DEBIT' as const
  const inverseDirection = body.operation === 'add' ? 'DEBIT' as const : 'CREDIT' as const
  const txType = body.operation === 'add' ? 'DEPOSIT' as const : 'WITHDRAWAL' as const

  // Both operations in a single DB transaction
  const result = await db.transaction(async () => {
    // Target wallet operation
    const targetResult = await executeTransaction({
      type: txType,
      walletId: targetWallet.id,
      direction,
      amount: body.amount,
      referenceType: 'MANUAL',
      description: body.description || `${body.operation} by ${session.role}`,
      createdBy: session.userId
    })

    // Inverse operation on sender's wallet
    await executeTransaction({
      type: txType,
      walletId: senderWallet.id,
      direction: inverseDirection,
      amount: body.amount,
      referenceType: 'MANUAL',
      description: `Inverse: ${body.operation} to user ${id}`,
      createdBy: session.userId
    })

    return targetResult
  })

  return result
})
