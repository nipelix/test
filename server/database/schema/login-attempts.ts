import { pgTable, serial, integer, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core'
import { users, loginMethodEnum } from './users'

export const loginAttempts = pgTable('login_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  identifier: varchar('identifier', { length: 255 }),
  method: loginMethodEnum('method').notNull().default('PASSWORD'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  success: boolean('success').notNull(),
  failReason: varchar('fail_reason', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('login_attempts_user_id_idx').on(table.userId),
  index('login_attempts_identifier_idx').on(table.identifier),
  index('login_attempts_created_at_idx').on(table.createdAt)
])
