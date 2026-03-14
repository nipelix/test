import { pgTable, serial, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'

import { sports } from './sports'
import { bettingGroups } from './betting-groups'

export const marketTypes = pgTable('market_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  sportId: integer('sport_id').references(() => sports.id),
  bettingGroupId: integer('betting_group_id').references(() => bettingGroups.id),
  category: varchar('category', { length: 200 }),
  extendsControl: boolean('extends_control').notNull().default(false),
  providerFeedType: varchar('provider_feed_type', { length: 50 }),
  selectionsCount: integer('selections_count').notNull().default(2),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('market_types_sport_id_idx').on(table.sportId),
  index('market_types_betting_group_id_idx').on(table.bettingGroupId),
  index('market_types_active_sort_idx').on(table.active, table.sortOrder)
])
