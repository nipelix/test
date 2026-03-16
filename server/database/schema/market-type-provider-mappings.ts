import { pgTable, serial, integer, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { marketTypes } from './market-types'
import { providers } from './providers'

export const marketTypeProviderMappings = pgTable('market_type_provider_mappings', {
  id: serial('id').primaryKey(),
  marketTypeId: integer('market_type_id').notNull().references(() => marketTypes.id, { onDelete: 'cascade' }),
  providerId: integer('provider_id').notNull().references(() => providers.id),
  externalId: integer('external_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('market_type_pm_uniq').on(table.marketTypeId, table.providerId, table.externalId),
  index('market_type_pm_entity_idx').on(table.marketTypeId),
  index('market_type_pm_provider_idx').on(table.providerId)
])
