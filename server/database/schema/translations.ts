import { pgEnum } from 'drizzle-orm/pg-core'

// Entity type enum - used by provider_mappings table
export const entityTypeEnum = pgEnum('entity_type', [
  'SPORT',
  'COUNTRY',
  'LEAGUE',
  'MARKET_TYPE',
  'SELECTION_TEMPLATE',
  'BETTING_GROUP'
])
