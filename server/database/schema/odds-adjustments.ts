import { pgTable, serial, integer, varchar, numeric, boolean, timestamp, pgEnum, index } from 'drizzle-orm/pg-core'
import { sports } from './sports'
import { marketTypes } from './market-types'

export const oddsAdjustmentScopeEnum = pgEnum('odds_adjustment_scope', [
  'SYSTEM_GLOBAL',
  'ROLE',
  'BETTING_GROUP',
  'MATCH',
  'USER'
])

export const adjustmentTypeEnum = pgEnum('adjustment_type', [
  'FIXED',
  'PERCENTAGE'
])

export const oddsAdjustments = pgTable('odds_adjustments', {
  id: serial('id').primaryKey(),
  scope: oddsAdjustmentScopeEnum('scope').notNull(),
  scopeRef: varchar('scope_ref', { length: 255 }).notNull(),
  sportId: integer('sport_id').references(() => sports.id),
  marketTypeId: integer('market_type_id').references(() => marketTypes.id),
  adjustmentType: adjustmentTypeEnum('adjustment_type').notNull().default('FIXED'),
  value: numeric('value', { precision: 10, scale: 4 }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('odds_adj_scope_ref_idx').on(table.scope, table.scopeRef),
  index('odds_adj_sport_id_idx').on(table.sportId),
  index('odds_adj_market_type_id_idx').on(table.marketTypeId),
  index('odds_adj_active_idx').on(table.active)
])
