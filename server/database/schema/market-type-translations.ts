import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { marketTypes } from './market-types'
import { languages } from './languages'

export const marketTypeTranslations = pgTable('market_type_translations', {
  id: serial('id').primaryKey(),
  marketTypeId: integer('market_type_id').notNull().references(() => marketTypes.id, { onDelete: 'cascade' }),
  languageId: integer('language_id').notNull().references(() => languages.id),
  field: varchar('field', { length: 50 }).notNull(),
  value: varchar('value', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('market_type_trans_entity_lang_field_uniq').on(table.marketTypeId, table.languageId, table.field),
  index('market_type_trans_entity_lang_idx').on(table.marketTypeId, table.languageId),
  index('market_type_trans_language_id_idx').on(table.languageId)
])
