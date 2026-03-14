import { pgTable, serial, varchar, jsonb, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core'

export const settingScopeEnum = pgEnum('setting_scope', [
  'GLOBAL',
  'ROLE',
  'USER'
])

export const bettingSettings = pgTable('betting_settings', {
  id: serial('id').primaryKey(),
  scope: settingScopeEnum('scope').notNull(),
  scopeRef: varchar('scope_ref', { length: 255 }).notNull().default('GLOBAL'),
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('betting_settings_scope_ref_key_idx').on(table.scope, table.scopeRef, table.key)
])
