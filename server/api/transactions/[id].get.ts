import { eq } from 'drizzle-orm'
import { transactions, ledgerEntries } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const db = useDb()

  const [tx] = await db.select().from(transactions).where(eq(transactions.id, id))
  if (!tx) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  const entries = await db.select().from(ledgerEntries).where(eq(ledgerEntries.transactionId, id))

  // Verify access: player can only see own transactions
  if (session.role === 'PLAYER') {
    const wallet = await getWalletByUserId(session.userId)
    const hasAccess = entries.some(e => e.walletId === wallet?.id)
    if (!hasAccess) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }
  }

  return { ...tx, entries }
})
