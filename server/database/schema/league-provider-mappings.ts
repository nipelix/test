import { pgTable, serial, integer, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { leagues } from './leagues'
import { providers } from './providers'

export const leagueProviderMappings = pgTable('league_provider_mappings', {
  id: serial('id').primaryKey(),
  leagueId: integer('league_id').notNull().references(() => leagues.id, { onDelete: 'cascade' }),
  providerId: integer('provider_id').notNull().references(() => providers.id),
  externalId: integer('external_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('league_pm_uniq').on(table.leagueId, table.providerId, table.externalId),
  index('league_pm_league_idx').on(table.leagueId),
  index('league_pm_provider_idx').on(table.providerId)
])
