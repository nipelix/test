import { pgTable, serial, integer, varchar, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { languages } from './languages'

export const uiTranslations = pgTable('ui_translations', {
  id: serial('id').primaryKey(),
  languageId: integer('language_id').notNull().references(() => languages.id),
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('ui_translations_lang_key_uniq').on(table.languageId, table.key),
  index('ui_translations_language_idx').on(table.languageId)
])
