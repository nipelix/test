import { pgTable, serial, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }),
  flag: varchar('flag', { length: 255 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('countries_active_idx').on(table.active)
])
