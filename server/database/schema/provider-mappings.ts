import { pgTable, serial, integer, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { providers } from './providers'
import { entityTypeEnum } from './translations'

export const providerMappings = pgTable('provider_mappings', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull().references(() => providers.id),
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  externalId: integer('external_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('provider_mappings_uniq').on(table.providerId, table.entityType, table.entityId, table.externalId),
  index('provider_mappings_entity_idx').on(table.entityType, table.entityId)
])
