import { eq, sql } from 'drizzle-orm'
import { wallets, transactions, ledgerEntries, creditRanges } from '../database/schema'

type DbTransaction = Parameters<Parameters<ReturnType<typeof useDb>['transaction']>[0]>[0]

interface TransactionInput {
  type: string
  walletId: number
  direction: 'DEBIT' | 'CREDIT'
  amount: number
  idempotencyKey: string
  referenceType?: string
  referenceId?: number
  description?: string
  metadata?: any
  createdBy?: number
}

interface TransactionResult {
  transactionId: number
  walletId: number
  balanceBefore: string
  balanceAfter: string
}

/**
 * Core ledger operation. Accepts optional tx for multi-wallet atomicity.
 * All arithmetic done in SQL (numeric type) — no JS floating-point.
 */
export async function executeTransaction(
  input: TransactionInput,
  tx?: DbTransaction
): Promise<TransactionResult> {
  const executor = tx ?? useDb()

  // Lock wallet row
  const [wallet] = await executor.select({ id: wallets.id, balance: wallets.balance })
    .from(wallets)
    .where(eq(wallets.id, input.walletId))
    .for('update')

  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
  }

  // Calculate new balance in SQL to avoid floating-point
  const amountStr = String(input.amount)
  let newBalanceSql: ReturnType<typeof sql>

  if (input.direction === 'DEBIT') {
    // Check sufficient balance
    const currentBalance = Number(wallet.balance)
    if (currentBalance < input.amount) {
      throw createError({ statusCode: 400, statusMessage: 'Insufficient balance' })
    }
    newBalanceSql = sql`${wallets.balance}::numeric - ${amountStr}::numeric`
  } else {
    newBalanceSql = sql`${wallets.balance}::numeric + ${amountStr}::numeric`
  }

  // Update wallet balance atomically in SQL
  const [updated] = await executor.update(wallets)
    .set({ balance: sql`(${newBalanceSql})::text` })
    .where(eq(wallets.id, input.walletId))
    .returning({ balance: wallets.balance })

  if (!updated) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update wallet' })
  }

  // Create transaction record
  const [txRecord] = await executor.insert(transactions).values({
    type: input.type as any,
    idempotencyKey: input.idempotencyKey,
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
  await executor.insert(ledgerEntries).values({
    transactionId: txRecord.id,
    walletId: input.walletId,
    direction: input.direction as any,
    amount: amountStr,
    balanceBefore: wallet.balance,
    balanceAfter: updated.balance
  })

  return {
    transactionId: txRecord.id,
    walletId: input.walletId,
    balanceBefore: wallet.balance,
    balanceAfter: updated.balance
  }
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

/**
 * Place bet: debit player + debit dealer credit — SINGLE atomic transaction.
 */
export async function placeBetTransaction(
  playerWalletId: number,
  dealerWalletId: number,
  stake: number,
  creditDeduction: number,
  couponId: number,
  createdBy: number
): Promise<{ playerTx: TransactionResult; dealerTx: TransactionResult }> {
  const db = useDb()
  const idempotencyKey = `bet:${couponId}`

  return db.transaction(async (tx) => {
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
    }, tx)

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
    }, tx)

    return { playerTx, dealerTx }
  })
}

export async function winTransaction(
  playerWalletId: number,
  amount: number,
  couponId: number,
  createdBy: number
): Promise<TransactionResult> {
  const db = useDb()
  return db.transaction(async (tx) => {
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
    }, tx)
  })
}

/**
 * Cancel bet: refund player + return dealer credit — SINGLE atomic transaction.
 */
export async function cancelBetTransaction(
  playerWalletId: number,
  dealerWalletId: number,
  stake: number,
  creditDeduction: number,
  couponId: number,
  createdBy: number
): Promise<{ playerTx: TransactionResult; dealerTx: TransactionResult }> {
  const db = useDb()
  const idempotencyKey = `cancel:${couponId}`

  return db.transaction(async (tx) => {
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
    }, tx)

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
    }, tx)

    return { playerTx, dealerTx }
  })
}

export async function calculateCreditDeduction(stake: number): Promise<number> {
  const db = useDb()
  const ranges = await db.select()
    .from(creditRanges)
    .where(eq(creditRanges.active, true))
    .orderBy(creditRanges.minAmount)

  for (const range of ranges) {
    const min = Number(range.minAmount)
    const max = Number(range.maxAmount)
    if (stake >= min && stake <= max) {
      return Number(range.creditDeduction)
    }
  }

  if (ranges.length > 0) {
    const lastRange = ranges[ranges.length - 1]!
    if (stake > Number(lastRange.maxAmount)) {
      return Number(lastRange.creditDeduction)
    }
  }

  return 0
}
