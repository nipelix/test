import { pgTable, integer, primaryKey, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const userTree = pgTable('user_tree', {
  ancestorId: integer('ancestor_id').notNull().references(() => users.id),
  descendantId: integer('descendant_id').notNull().references(() => users.id),
  depth: integer('depth').notNull()
}, (table) => [
  primaryKey({ columns: [table.ancestorId, table.descendantId] }),
  index('user_tree_descendant_idx').on(table.descendantId),
  index('user_tree_ancestor_depth_idx').on(table.ancestorId, table.depth)
])
