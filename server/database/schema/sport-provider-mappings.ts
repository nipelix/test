import { pgTable, serial, integer, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { sports } from './sports'
import { providers } from './providers'

export const sportProviderMappings = pgTable('sport_provider_mappings', {
  id: serial('id').primaryKey(),
  sportId: integer('sport_id').notNull().references(() => sports.id, { onDelete: 'cascade' }),
  providerId: integer('provider_id').notNull().references(() => providers.id),
  externalId: integer('external_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('sport_pm_uniq').on(table.sportId, table.providerId, table.externalId),
  index('sport_pm_sport_idx').on(table.sportId),
  index('sport_pm_provider_idx').on(table.providerId)
])
