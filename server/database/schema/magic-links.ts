import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

export const magicLinks = pgTable('magic_links', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 255 }).notNull().unique(),
  used: boolean('used').notNull().default(false),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})
