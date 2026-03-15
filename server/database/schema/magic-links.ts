import { pgTable, serial, integer, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const magicLinks = pgTable('magic_links', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('magic_links_token_hash_idx').on(table.tokenHash),
  index('magic_links_user_id_idx').on(table.userId)
])
