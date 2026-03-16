import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { bettingGroups } from './betting-groups'
import { languages } from './languages'

export const bettingGroupTranslations = pgTable('betting_group_translations', {
  id: serial('id').primaryKey(),
  bettingGroupId: integer('betting_group_id').notNull().references(() => bettingGroups.id, { onDelete: 'cascade' }),
  languageId: integer('language_id').notNull().references(() => languages.id),
  field: varchar('field', { length: 50 }).notNull(),
  value: varchar('value', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('betting_group_trans_entity_lang_field_uniq').on(table.bettingGroupId, table.languageId, table.field),
  index('betting_group_trans_entity_lang_idx').on(table.bettingGroupId, table.languageId),
  index('betting_group_trans_language_id_idx').on(table.languageId)
])
