---
name: Hierarchical Multi-tenancy Expert
description: User hierarchy with closure table, role-based access, parent-child balance flow, tree operations
globs: ["server/utils/tree.ts", "server/utils/auth.ts", "server/api/users/**", "shared/types/roles.ts", "app/composables/useParentSelection.ts"]
---

# Hierarchical Multi-tenancy Expert

You are an expert in hierarchical multi-tenant systems with closure table patterns.

## Role Hierarchy (6 levels)

```
SUPER_ADMIN (level 0) — Full system access, no wallet
  └── ADMIN (level 1) — No wallet, creates agents
      └── AGENT (level 2) — CREDIT wallet
          └── DEALER (level 3) — CREDIT wallet
              └── SUB_DEALER (level 4) — MONEY wallet
                  └── PLAYER (level 5) — MONEY wallet
```

### Flexible Relationships
- DEALER parent can be AGENT **or** directly ADMIN (flexible)
- All other relationships are strict parent-child

## Closure Table Pattern (user_tree)

```sql
CREATE TABLE user_tree (
  ancestor_id INTEGER NOT NULL,
  descendant_id INTEGER NOT NULL,
  depth INTEGER NOT NULL,
  PRIMARY KEY (ancestor_id, descendant_id)
);
```

### Operations
- **addUserToTree(userId, parentId)**: Insert self-reference (depth 0) + copy parent's ancestor chain (depth + 1). MUST be in a transaction.
- **isDescendant(ancestorId, candidateId)**: O(1) lookup in closure table
- **getDescendantIds(ancestorId)**: All users in subtree
- **getDirectChildIds(parentId)**: Only depth=1 children
- **moveUserInTree(userId, newParentId)**:
  1. Check for circular reference FIRST (`isDescendant(userId, newParentId)` must be false)
  2. Delete external ancestor links
  3. Re-insert from new parent
  4. MUST be in a transaction (crash between delete and insert = orphaned subtree)

### Query Patterns
```sql
-- Get all descendants (for filtering user lists)
SELECT descendant_id FROM user_tree WHERE ancestor_id = ?

-- Use SQL subquery instead of IN clause for large hierarchies
WHERE users.id IN (SELECT descendant_id FROM user_tree WHERE ancestor_id = ?)
```

## Access Control

### requireTreeAccess(event, targetUserId)
1. Self-access: always allowed
2. SUPER_ADMIN: access everyone
3. Others: check `isDescendant(session.userId, targetUserId)`

### requireRole(event, allowedRoles)
- Check session role against allowed roles array

### canCreateRole(actor, target)
- Actor's level must be lower (higher authority) than target's level

### canManageBalance(actor, target)
- Defined by CREDIT_FLOW map (narrower than creation permissions)

## User Creation Rules
- Each role can create roles below them
- SUPER_ADMIN: can create ALL lower roles
- Parent hierarchy must be respected:
  - Creating DEALER: Admin selection mandatory, Agent optional
  - Creating SUB_DEALER: Dealer selection mandatory
  - Creating PLAYER: SubDealer selection mandatory
- Wallet created automatically with balance 0
- Tree entry created immediately after user insertion

## Parent Selection Cascade (UI)
When creating/editing users with parent dropdowns:
```
Admin dropdown changes → reset Agent, Dealer, SubDealer
Dealer dropdown changes → reset SubDealer
```
- Cascade watchers prevent stale selections
- Use `initializing` flag during edit mode pre-fill to prevent cascade

## API Scoping
- Non-SUPER_ADMIN users see only their descendants
- User list: `WHERE id IN (SELECT descendant_id FROM user_tree WHERE ancestor_id = ?)`
- Never use `getDescendantIds()` + `IN (array)` for large hierarchies — use SQL subquery
