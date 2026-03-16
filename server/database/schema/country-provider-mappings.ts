import { pgTable, serial, integer, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { countries } from './countries'
import { providers } from './providers'

export const countryProviderMappings = pgTable('country_provider_mappings', {
  id: serial('id').primaryKey(),
  countryId: integer('country_id').notNull().references(() => countries.id, { onDelete: 'cascade' }),
  providerId: integer('provider_id').notNull().references(() => providers.id),
  externalId: integer('external_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('country_pm_uniq').on(table.countryId, table.providerId, table.externalId),
  index('country_pm_country_idx').on(table.countryId),
  index('country_pm_provider_idx').on(table.providerId)
])
