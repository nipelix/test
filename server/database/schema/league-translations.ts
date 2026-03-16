import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { leagues } from './leagues'
import { languages } from './languages'

export const leagueTranslations = pgTable('league_translations', {
  id: serial('id').primaryKey(),
  leagueId: integer('league_id').notNull().references(() => leagues.id, { onDelete: 'cascade' }),
  languageId: integer('language_id').notNull().references(() => languages.id),
  field: varchar('field', { length: 50 }).notNull(),
  value: varchar('value', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('league_trans_entity_lang_field_uniq').on(table.leagueId, table.languageId, table.field),
  index('league_trans_entity_lang_idx').on(table.leagueId, table.languageId),
  index('league_trans_language_id_idx').on(table.languageId)
])
