import { pgTable, serial, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const passkeys = pgTable('passkeys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  credentialId: varchar('credential_id', { length: 500 }).notNull().unique(),
  publicKey: varchar('public_key', { length: 2000 }).notNull(),
  counter: integer('counter').notNull().default(0),
  name: varchar('name', { length: 255 }),
  deviceType: varchar('device_type', { length: 50 }),
  backedUp: boolean('backed_up').notNull().default(false),
  transports: varchar('transports', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true })
}, (table) => [
  index('passkeys_user_id_idx').on(table.userId),
  index('passkeys_credential_id_idx').on(table.credentialId)
])
