import { pgTable, serial, integer, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { selectionTemplates } from './selection-templates'
import { providers } from './providers'

export const selectionTemplateProviderMappings = pgTable('selection_template_provider_mappings', {
  id: serial('id').primaryKey(),
  selectionTemplateId: integer('selection_template_id').notNull().references(() => selectionTemplates.id, { onDelete: 'cascade' }),
  providerId: integer('provider_id').notNull().references(() => providers.id),
  externalId: integer('external_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('sel_tmpl_pm_uniq').on(table.selectionTemplateId, table.providerId, table.externalId),
  index('sel_tmpl_pm_entity_idx').on(table.selectionTemplateId),
  index('sel_tmpl_pm_provider_idx').on(table.providerId)
])
