import { pgTable, serial, integer, varchar, timestamp, pgEnum, index, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Inline for drizzle-kit compatibility (cannot resolve ~~ alias)
const ROLES_LIST = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER', 'PLAYER'] as const
const WALLET_TYPES_LIST = ['CREDIT', 'MONEY', 'NONE'] as const

export const roleEnum = pgEnum('role', [...ROLES_LIST])

export const userStatusEnum = pgEnum('user_status', [
  'ACTIVE',
  'PASSIVE'
])

export const walletTypeEnum = pgEnum('wallet_type', [...WALLET_TYPES_LIST])

export const loginMethodEnum = pgEnum('login_method', [
  'PASSWORD',
  'MAGIC_LINK',
  'PASSKEY'
])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('PLAYER'),
  parentId: integer('parent_id').references((): any => users.id),
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  walletType: walletTypeEnum('wallet_type').notNull().default('NONE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  preferences: jsonb('preferences').default('{}')
}, (table) => [
  uniqueIndex('users_username_unique').on(table.username).where(sql`${table.deletedAt} IS NULL`),
  uniqueIndex('users_email_unique').on(table.email).where(sql`${table.deletedAt} IS NULL`),
  index('users_role_status_idx').on(table.role, table.status),
  index('users_parent_id_idx').on(table.parentId),
  index('users_deleted_at_idx').on(table.deletedAt)
])
