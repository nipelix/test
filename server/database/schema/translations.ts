import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core'

export const entityTypeEnum = pgEnum('entity_type', [
  'SPORT',
  'COUNTRY',
  'LEAGUE',
  'MARKET_TYPE',
  'SELECTION_TEMPLATE'
])

export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  lang: varchar('lang', { length: 10 }).notNull(),
  field: varchar('field', { length: 50 }).notNull(),
  value: varchar('value', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('translations_entity_lang_field_uniq').on(table.entityType, table.entityId, table.lang, table.field),
  index('translations_entity_idx').on(table.entityType, table.entityId)
])
