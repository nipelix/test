import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { selectionTemplates } from './selection-templates'
import { languages } from './languages'

export const selectionTemplateTranslations = pgTable('selection_template_translations', {
  id: serial('id').primaryKey(),
  selectionTemplateId: integer('selection_template_id').notNull().references(() => selectionTemplates.id, { onDelete: 'cascade' }),
  languageId: integer('language_id').notNull().references(() => languages.id),
  field: varchar('field', { length: 50 }).notNull(),
  value: varchar('value', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('sel_tmpl_trans_entity_lang_field_uniq').on(table.selectionTemplateId, table.languageId, table.field),
  index('sel_tmpl_trans_entity_lang_idx').on(table.selectionTemplateId, table.languageId),
  index('sel_tmpl_trans_language_id_idx').on(table.languageId)
])
