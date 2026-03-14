import { pgTable, serial, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { sports } from './sports'

export const bettingGroups = pgTable('betting_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  sportId: integer('sport_id').notNull().references(() => sports.id),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('betting_groups_sport_id_idx').on(table.sportId),
  index('betting_groups_active_sort_idx').on(table.active, table.sortOrder)
])
