import { eq, and, sql, gte, lte } from 'drizzle-orm'
import { wallets, transactions, ledgerEntries, creditRanges } from '../database/schema'

interface TransactionInput {
  type: string
  walletId: number
  direction: 'DEBIT' | 'CREDIT'
  amount: number
  idempotencyKey?: string
  referenceType?: string
  referenceId?: number
  description?: string
  metadata?: any
  createdBy?: number
}

interface TransactionResult {
  transactionId: number
  walletId: number
  balanceBefore: number
  balanceAfter: number
}

export async function executeTransaction(input: TransactionInput): Promise<TransactionResult> {
  const db = useDb()

  // Use raw SQL for serializable transaction with FOR UPDATE
  const result = await db.transaction(async (tx) => {
    // Lock the wallet row
    const [wallet] = await tx.select()
      .from(wallets)
      .where(eq(wallets.id, input.walletId))
      .for('update')

    if (!wallet) {
      throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
    }

    const balanceBefore = parseFloat(wallet.balance)
    let balanceAfter: number

    if (input.direction === 'DEBIT') {
      balanceAfter = balanceBefore - input.amount
      if (balanceAfter < 0) {
        throw createError({ statusCode: 400, statusMessage: 'Insufficient balance' })
      }
    } else {
      balanceAfter = balanceBefore + input.amount
    }

    // Create transaction record
    const [txRecord] = await tx.insert(transactions).values({
      type: input.type as any,
      idempotencyKey: input.idempotencyKey || null,
      referenceType: input.referenceType || null,
      referenceId: input.referenceId || null,
      description: input.description || null,
      metadata: input.metadata || null,
      createdBy: input.createdBy || null
    }).returning()

    if (!txRecord) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create transaction' })
    }

    // Create ledger entry
    await tx.insert(ledgerEntries).values({
      transactionId: txRecord.id,
      walletId: input.walletId,
      direction: input.direction as any,
      amount: String(input.amount),
      balanceBefore: String(balanceBefore),
      balanceAfter: String(balanceAfter)
    })

    // Update wallet balance and version
    await tx.update(wallets)
      .set({
        balance: String(balanceAfter),
        version: sql`${wallets.version} + 1`
      })
      .where(eq(wallets.id, input.walletId))

    return {
      transactionId: txRecord.id,
      walletId: input.walletId,
      balanceBefore,
      balanceAfter
    }
  })

  return result
}

export async function getWalletByUserId(userId: number) {
  const db = useDb()
  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId))
  return wallet || null
}

export async function createWallet(userId: number) {
  const db = useDb()
  const [wallet] = await db.insert(wallets).values({
    userId,
    balance: '0',
    creditLimit: '0',
    currency: 'TRY'
  }).returning()
  return wallet
}

export async function placeBetTransaction(
  playerWalletId: number,
  dealerWalletId: number,
  stake: number,
  creditDeduction: number,
  couponId: number,
  createdBy: number
): Promise<{ playerTx: TransactionResult; dealerTx: TransactionResult }> {
  const idempotencyKey = `bet:${couponId}`

  // Debit player's wallet
  const playerTx = await executeTransaction({
    type: 'BET',
    walletId: playerWalletId,
    direction: 'DEBIT',
    amount: stake,
    idempotencyKey: `${idempotencyKey}:player`,
    referenceType: 'COUPON',
    referenceId: couponId,
    description: `Bet placed - Coupon ${couponId}`,
    createdBy
  })

  // Debit dealer's credit
  const dealerTx = await executeTransaction({
    type: 'CREDIT_DEDUCTION',
    walletId: dealerWalletId,
    direction: 'DEBIT',
    amount: creditDeduction,
    idempotencyKey: `${idempotencyKey}:dealer`,
    referenceType: 'COUPON',
    referenceId: couponId,
    description: `Credit deduction for coupon ${couponId}`,
    createdBy
  })

  return { playerTx, dealerTx }
}

export async function winTransaction(
  playerWalletId: number,
  amount: number,
  couponId: number,
  createdBy: number
): Promise<TransactionResult> {
  return executeTransaction({
    type: 'WIN',
    walletId: playerWalletId,
    direction: 'CREDIT',
    amount,
    idempotencyKey: `win:${couponId}`,
    referenceType: 'COUPON',
    referenceId: couponId,
    description: `Win payout - Coupon ${couponId}`,
    createdBy
  })
}

export async function cancelBetTransaction(
  playerWalletId: number,
  dealerWalletId: number,
  stake: number,
  creditDeduction: number,
  couponId: number,
  createdBy: number
): Promise<{ playerTx: TransactionResult; dealerTx: TransactionResult }> {
  const idempotencyKey = `cancel:${couponId}`

  // Refund player
  const playerTx = await executeTransaction({
    type: 'CANCEL',
    walletId: playerWalletId,
    direction: 'CREDIT',
    amount: stake,
    idempotencyKey: `${idempotencyKey}:player`,
    referenceType: 'COUPON',
    referenceId: couponId,
    description: `Bet cancelled - Coupon ${couponId}`,
    createdBy
  })

  // Return dealer credit
  const dealerTx = await executeTransaction({
    type: 'CREDIT_RETURN',
    walletId: dealerWalletId,
    direction: 'CREDIT',
    amount: creditDeduction,
    idempotencyKey: `${idempotencyKey}:dealer`,
    referenceType: 'COUPON',
    referenceId: couponId,
    description: `Credit return for cancelled coupon ${couponId}`,
    createdBy
  })

  return { playerTx, dealerTx }
}

export async function calculateCreditDeduction(stake: number): Promise<number> {
  const db = useDb()
  const ranges = await db.select()
    .from(creditRanges)
    .where(eq(creditRanges.active, true))
    .orderBy(creditRanges.minAmount)

  for (const range of ranges) {
    const min = parseFloat(range.minAmount)
    const max = parseFloat(range.maxAmount)
    if (stake >= min && stake <= max) {
      return parseFloat(range.creditDeduction)
    }
  }

  // If no range matches, use the last range (highest)
  if (ranges.length > 0) {
    const lastRange = ranges[ranges.length - 1]!
    if (stake > parseFloat(lastRange.maxAmount)) {
      return parseFloat(lastRange.creditDeduction)
    }
  }

  return 0
}
