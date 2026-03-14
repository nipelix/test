import { pgTable, serial, integer, varchar, numeric, timestamp, pgEnum, index } from 'drizzle-orm/pg-core'
import { matches } from './matches'
import { marketTypes } from './market-types'

export const marketStatusEnum = pgEnum('market_status', [
  'OPEN',
  'SUSPENDED',
  'SETTLED',
  'CANCELLED'
])

export const markets = pgTable('markets', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').notNull().references(() => matches.id),
  marketTypeId: integer('market_type_id').notNull().references(() => marketTypes.id),
  name: varchar('name', { length: 200 }).notNull(),
  line: numeric('line', { precision: 10, scale: 2 }),
  status: marketStatusEnum('status').notNull().default('OPEN'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('markets_match_id_idx').on(table.matchId),
  index('markets_market_type_id_idx').on(table.marketTypeId),
  index('markets_status_idx').on(table.status)
])
