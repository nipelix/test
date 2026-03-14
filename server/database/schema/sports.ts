import { pgTable, serial, varchar, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core'

export const sports = pgTable('sports', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 100 }),
  category: varchar('category', { length: 100 }),
  banner: varchar('banner', { length: 255 }),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('sports_active_sort_idx').on(table.active, table.sortOrder)
])
