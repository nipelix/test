import { pgTable, serial, integer, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: integer('entity_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('activity_logs_user_id_idx').on(table.userId),
  index('activity_logs_action_idx').on(table.action),
  index('activity_logs_created_at_idx').on(table.createdAt)
])
