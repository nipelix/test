import { eq } from 'drizzle-orm'
import { wallets } from '../../../database/schema'
import { z } from 'zod'

const creditSchema = z.object({
  amount: z.number().positive()
})

export default defineEventHandler(async (event) => {
  const session = requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER'])
  const userId = Number(getRouterParam(event, 'userId'))
  if (!userId || isNaN(userId)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, creditSchema.parse)

  await requireTreeAccess(event, userId)

  const db = useDb()
  const wallet = await getWalletByUserId(userId)
  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
  }

  const currentCredit = Number(wallet.creditLimit) || 0
  const [updated] = await db.update(wallets)
    .set({ creditLimit: String(currentCredit + body.amount) })
    .where(eq(wallets.id, wallet.id))
    .returning()

  return updated
})
