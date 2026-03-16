import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { countries } from './countries'
import { languages } from './languages'

export const countryTranslations = pgTable('country_translations', {
  id: serial('id').primaryKey(),
  countryId: integer('country_id').notNull().references(() => countries.id, { onDelete: 'cascade' }),
  languageId: integer('language_id').notNull().references(() => languages.id),
  field: varchar('field', { length: 50 }).notNull(),
  value: varchar('value', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('country_trans_entity_lang_field_uniq').on(table.countryId, table.languageId, table.field),
  index('country_trans_entity_lang_idx').on(table.countryId, table.languageId),
  index('country_trans_language_id_idx').on(table.languageId)
])
