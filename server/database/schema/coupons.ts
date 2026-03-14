import { pgTable, serial, integer, varchar, numeric, boolean, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const couponTypeEnum = pgEnum('coupon_type', [
  'SINGLE',
  'COMBINATION',
  'SYSTEM'
])

export const couponStatusEnum = pgEnum('coupon_status', [
  'PENDING',
  'ONGOING',
  'WINNING',
  'LOSING',
  'WON',
  'LOST',
  'CANCELLED',
  'REFUNDED'
])

export const couponSelectionStatusEnum = pgEnum('coupon_selection_status', [
  'PENDING',
  'WON',
  'LOST',
  'VOID'
])

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  betSlipNo: varchar('bet_slip_no', { length: 50 }).notNull().unique(),
  playerId: integer('player_id').notNull().references(() => users.id),
  dealerId: integer('dealer_id').notNull().references(() => users.id),
  type: couponTypeEnum('type').notNull().default('SINGLE'),
  status: couponStatusEnum('status').notNull().default('PENDING'),
  stake: numeric('stake', { precision: 15, scale: 2 }).notNull(),
  totalOdds: numeric('total_odds', { precision: 15, scale: 2 }).notNull(),
  potentialPayout: numeric('potential_payout', { precision: 15, scale: 2 }).notNull(),
  actualPayout: numeric('actual_payout', { precision: 15, scale: 2 }).default('0'),
  creditDeduction: numeric('credit_deduction', { precision: 15, scale: 2 }).default('0'),
  couponName: varchar('coupon_name', { length: 200 }),
  systemBetConfig: jsonb('system_bet_config'),
  ipAddress: varchar('ip_address', { length: 45 }),
  oddsSnapshotAt: timestamp('odds_snapshot_at', { withTimezone: true }),
  hasLiveSelections: boolean('has_live_selections').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy: integer('cancelled_by')
}, (table) => [
  index('coupons_player_id_idx').on(table.playerId),
  index('coupons_dealer_id_idx').on(table.dealerId),
  index('coupons_status_idx').on(table.status),
  index('coupons_created_at_idx').on(table.createdAt)
])

export const couponSelections = pgTable('coupon_selections', {
  id: serial('id').primaryKey(),
  couponId: integer('coupon_id').notNull().references(() => coupons.id),
  matchId: integer('match_id').notNull(),
  marketId: integer('market_id').notNull(),
  selectionId: integer('selection_id').notNull(),
  selectionName: varchar('selection_name', { length: 200 }).notNull(),
  marketName: varchar('market_name', { length: 200 }).notNull(),
  homeTeam: varchar('home_team', { length: 200 }).notNull(),
  awayTeam: varchar('away_team', { length: 200 }).notNull(),
  leagueName: varchar('league_name', { length: 200 }),
  snapshotOdds: numeric('snapshot_odds', { precision: 10, scale: 2 }).notNull(),
  status: couponSelectionStatusEnum('status').notNull().default('PENDING'),
  isLive: boolean('is_live').notNull().default(false),
  matchScore: varchar('match_score', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('coupon_selections_coupon_id_idx').on(table.couponId),
  index('coupon_selections_match_id_idx').on(table.matchId),
  index('coupon_selections_selection_id_idx').on(table.selectionId)
])
