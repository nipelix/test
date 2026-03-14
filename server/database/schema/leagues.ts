import { pgTable, serial, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { sports } from './sports'
import { countries } from './countries'

export const leagues = pgTable('leagues', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  sportId: integer('sport_id').notNull().references(() => sports.id),
  countryId: integer('country_id').notNull().references(() => countries.id),
  category: varchar('category', { length: 200 }),
  specialIcon: varchar('special_icon', { length: 255 }),
  popular: boolean('popular').notNull().default(false),
  mostPopular: boolean('most_popular').notNull().default(false),
  mbs: integer('mbs').notNull().default(1),
  type: varchar('type', { length: 50 }),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('leagues_sport_id_idx').on(table.sportId),
  index('leagues_country_id_idx').on(table.countryId),
  index('leagues_active_sort_idx').on(table.active, table.sortOrder)
])
