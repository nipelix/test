import { pgTable, serial, numeric, boolean, timestamp } from 'drizzle-orm/pg-core'

export const creditRanges = pgTable('credit_ranges', {
  id: serial('id').primaryKey(),
  minAmount: numeric('min_amount', { precision: 15, scale: 2 }).notNull(),
  maxAmount: numeric('max_amount', { precision: 15, scale: 2 }).notNull(),
  creditDeduction: numeric('credit_deduction', { precision: 10, scale: 2 }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})
