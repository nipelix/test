import { pgTable, serial, integer, varchar, numeric, timestamp, pgEnum, index } from 'drizzle-orm/pg-core'
import { markets } from './markets'

export const selectionStatusEnum = pgEnum('selection_status', [
  'ACTIVE',
  'SUSPENDED',
  'WON',
  'LOST',
  'VOID'
])

export const selections = pgTable('selections', {
  id: serial('id').primaryKey(),
  marketId: integer('market_id').notNull().references(() => markets.id),
  name: varchar('name', { length: 200 }).notNull(),
  label: varchar('label', { length: 50 }).notNull(),
  baseOdds: numeric('base_odds', { precision: 10, scale: 2 }).notNull(),
  status: selectionStatusEnum('status').notNull().default('ACTIVE'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('selections_market_id_idx').on(table.marketId),
  index('selections_status_idx').on(table.status)
])
