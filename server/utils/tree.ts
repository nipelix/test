import { eq, and, sql, inArray, notInArray } from 'drizzle-orm'
import { userTree } from '../database/schema'

export async function addUserToTree(userId: number, parentId: number | null): Promise<void> {
  const db = useDb()

  // Self-reference (depth 0)
  await db.insert(userTree).values({
    ancestorId: userId,
    descendantId: userId,
    depth: 0
  })

  // Copy ancestor chain from parent
  if (parentId) {
    await db.execute(sql`
      INSERT INTO user_tree (ancestor_id, descendant_id, depth)
      SELECT ancestor_id, ${userId}, depth + 1
      FROM user_tree
      WHERE descendant_id = ${parentId}
    `)
  }
}

export async function isDescendant(ancestorId: number, candidateId: number): Promise<boolean> {
  const db = useDb()
  const result = await db.select()
    .from(userTree)
    .where(and(
      eq(userTree.ancestorId, ancestorId),
      eq(userTree.descendantId, candidateId)
    ))
    .limit(1)

  return result.length > 0
}

export async function getDescendantIds(ancestorId: number): Promise<number[]> {
  const db = useDb()
  const rows = await db.select({ descendantId: userTree.descendantId })
    .from(userTree)
    .where(eq(userTree.ancestorId, ancestorId))

  return rows.map(r => r.descendantId)
}

export async function getDirectChildIds(parentId: number): Promise<number[]> {
  const db = useDb()
  const rows = await db.select({ descendantId: userTree.descendantId })
    .from(userTree)
    .where(and(
      eq(userTree.ancestorId, parentId),
      eq(userTree.depth, 1)
    ))

  return rows.map(r => r.descendantId)
}

export async function moveUserInTree(userId: number, newParentId: number): Promise<void> {
  const db = useDb()

  // Get all descendant IDs of the user (including self)
  const subtreeIds = await getDescendantIds(userId)

  // Delete all ancestor links coming from outside the subtree
  await db.execute(sql`
    DELETE FROM user_tree
    WHERE descendant_id IN (${sql.join(subtreeIds.map(id => sql`${id}`), sql`,`)})
    AND ancestor_id NOT IN (${sql.join(subtreeIds.map(id => sql`${id}`), sql`,`)})
  `)

  // Re-insert ancestor links from the new parent for the entire subtree
  await db.execute(sql`
    INSERT INTO user_tree (ancestor_id, descendant_id, depth)
    SELECT supertree.ancestor_id, subtree.descendant_id, supertree.depth + subtree.depth + 1
    FROM user_tree AS supertree
    CROSS JOIN user_tree AS subtree
    WHERE supertree.descendant_id = ${newParentId}
    AND subtree.ancestor_id = ${userId}
  `)
}
