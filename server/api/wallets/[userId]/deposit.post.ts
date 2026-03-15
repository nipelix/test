import { z } from 'zod'

const depositSchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const session = requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'])
  const userId = Number(getRouterParam(event, 'userId'))
  if (!userId || isNaN(userId)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, depositSchema.parse)

  await requireTreeAccess(event, userId)

  const wallet = await getWalletByUserId(userId)
  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
  }

  const result = await executeTransaction({
    type: 'DEPOSIT',
    walletId: wallet.id,
    direction: 'CREDIT',
    amount: body.amount,
    idempotencyKey: `deposit:${userId}:${session.userId}:${Date.now()}`,
    referenceType: 'MANUAL',
    description: body.description || `Deposit by ${session.role}`,
    createdBy: session.userId
  })

  return result
})
