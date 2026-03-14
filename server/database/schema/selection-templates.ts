import { pgTable, serial, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { marketTypes } from './market-types'

export const selectionTemplates = pgTable('selection_templates', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull(),
  marketGroupId: integer('market_group_id').references(() => marketTypes.id),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  statusType: varchar('status_type', { length: 50 }),
  validator: varchar('validator', { length: 500 }),
  drawNoBet: boolean('draw_no_bet').notNull().default(false),
  period: integer('period').notNull().default(0),
  providerFeedType: varchar('provider_feed_type', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('selection_templates_market_group_idx').on(table.marketGroupId),
  index('selection_templates_group_idx').on(table.groupId)
])
