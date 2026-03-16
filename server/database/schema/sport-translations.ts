import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { sports } from './sports'
import { languages } from './languages'

export const sportTranslations = pgTable('sport_translations', {
  id: serial('id').primaryKey(),
  sportId: integer('sport_id').notNull().references(() => sports.id, { onDelete: 'cascade' }),
  languageId: integer('language_id').notNull().references(() => languages.id),
  field: varchar('field', { length: 50 }).notNull(),
  value: varchar('value', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('sport_trans_entity_lang_field_uniq').on(table.sportId, table.languageId, table.field),
  index('sport_trans_entity_lang_idx').on(table.sportId, table.languageId),
  index('sport_trans_language_id_idx').on(table.languageId)
])
