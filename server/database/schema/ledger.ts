import { pgTable, serial, integer, varchar, numeric, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core'
import { wallets } from './wallets'

export const transactionTypeEnum = pgEnum('transaction_type', [
  'BET',
  'WIN',
  'CANCEL',
  'REFUND',
  'CREDIT_DEDUCTION',
  'CREDIT_RETURN',
  'DEPOSIT',
  'WITHDRAWAL',
  'BULK_ADJUSTMENT'
])

export const ledgerDirectionEnum = pgEnum('ledger_direction', [
  'DEBIT',
  'CREDIT'
])

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  type: transactionTypeEnum('type').notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: integer('reference_id'),
  description: varchar('description', { length: 500 }),
  metadata: jsonb('metadata'),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('transactions_type_idx').on(table.type),
  index('transactions_reference_idx').on(table.referenceType, table.referenceId),
  index('transactions_created_at_idx').on(table.createdAt),
  index('transactions_created_by_idx').on(table.createdBy)
])

export const ledgerEntries = pgTable('ledger_entries', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').notNull().references(() => transactions.id),
  walletId: integer('wallet_id').notNull().references(() => wallets.id),
  direction: ledgerDirectionEnum('direction').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  balanceBefore: numeric('balance_before', { precision: 15, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('ledger_entries_transaction_id_idx').on(table.transactionId),
  index('ledger_entries_wallet_id_idx').on(table.walletId),
  index('ledger_entries_wallet_created_idx').on(table.walletId, table.createdAt)
])
