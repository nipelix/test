import { eq, and, sql, desc } from 'drizzle-orm'
import { transactions, ledgerEntries, wallets } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  const query = getQuery(event)
  const type = query.type as string | undefined
  const userId = query.userId ? Number(query.userId) : undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const offset = (page - 1) * limit

  const db = useDb()

  // If specific user requested, check access
  let targetWalletId: string | undefined
  if (userId) {
    await requireTreeAccess(event, userId)
    const wallet = await getWalletByUserId(userId)
    if (wallet) targetWalletId = wallet.id
  } else if (session.role === 'PLAYER') {
    // Players can only see own transactions
    const wallet = await getWalletByUserId(session.userId)
    if (wallet) targetWalletId = wallet.id
  }

  if (targetWalletId) {
    // Get transactions for specific wallet via ledger entries
    const conditions = [eq(ledgerEntries.walletId, targetWalletId)]

    const [entries, countResult] = await Promise.all([
      db.select({
        id: ledgerEntries.id,
        transactionId: ledgerEntries.transactionId,
        direction: ledgerEntries.direction,
        amount: ledgerEntries.amount,
        balanceBefore: ledgerEntries.balanceBefore,
        balanceAfter: ledgerEntries.balanceAfter,
        type: transactions.type,
        description: transactions.description,
        referenceType: transactions.referenceType,
        referenceId: transactions.referenceId,
        createdAt: ledgerEntries.createdAt
      })
        .from(ledgerEntries)
        .innerJoin(transactions, eq(ledgerEntries.transactionId, transactions.id))
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(ledgerEntries.createdAt)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(ledgerEntries)
        .where(and(...conditions))
    ])

    return { data: entries, total: countResult[0]?.count || 0, page, limit }
  }

  // Admin view: all transactions
  if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' })
  }

  const conditions = []
  if (type) conditions.push(eq(transactions.type, type as any))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, countResult] = await Promise.all([
    db.select().from(transactions).where(where).limit(limit).offset(offset).orderBy(desc(transactions.createdAt)),
    db.select({ count: sql<number>`count(*)::int` }).from(transactions).where(where)
  ])

  return { data, total: countResult[0]?.count || 0, page, limit }
})
