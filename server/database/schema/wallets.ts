import { pgTable, serial, integer, numeric, varchar, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id).unique(),
  balance: numeric('balance', { precision: 15, scale: 2 }).notNull().default('0'),
  creditLimit: numeric('credit_limit', { precision: 15, scale: 2 }).notNull().default('0'),
  currency: varchar('currency', { length: 10 }).notNull().default('TRY'),
  version: integer('version').notNull().default(0)
})
