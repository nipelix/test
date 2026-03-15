import { pgTable, serial, numeric, boolean, timestamp, index } from 'drizzle-orm/pg-core'

export const creditRanges = pgTable('credit_ranges', {
  id: serial('id').primaryKey(),
  minAmount: numeric('min_amount', { precision: 15, scale: 2 }).notNull(),
  maxAmount: numeric('max_amount', { precision: 15, scale: 2 }).notNull(),
  creditDeduction: numeric('credit_deduction', { precision: 10, scale: 2 }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('credit_ranges_active_idx').on(table.active),
  index('credit_ranges_min_amount_idx').on(table.minAmount)
])
