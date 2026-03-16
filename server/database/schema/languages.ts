import { pgTable, serial, varchar, boolean, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  nativeName: varchar('native_name', { length: 100 }),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('languages_code_uniq').on(table.code),
  index('languages_active_sort_idx').on(table.active, table.sortOrder)
])
