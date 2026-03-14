import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../../database/schema'

const sortItemSchema = z.object({
  key: z.string(),
  direction: z.enum(['asc', 'desc'])
})

const tablePrefsSchema = z.object({
  columns: z.array(z.string()).optional(),
  sorts: z.array(sortItemSchema).optional()
})

const bodySchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  accentColor: z.enum(['green', 'purple', 'orange', 'red']).optional(),
  avatarId: z.number().int().min(1).max(60).optional(),
  tables: z.record(z.string(), tablePrefsSchema).optional()
}).strict()

function deepMergeTables(
  existing: Record<string, any> | undefined,
  incoming: Record<string, any>
): Record<string, any> {
  const result = { ...(existing ?? {}) }
  for (const [key, value] of Object.entries(incoming)) {
    result[key] = { ...(result[key] ?? {}), ...value }
  }
  return result
}

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const db = useDb()

  const body = await readValidatedBody(event, bodySchema.parse)

  const row = await db.select({ preferences: users.preferences })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)
    .then(rows => rows[0])

  const current = (row?.preferences as Record<string, any>) ?? {}

  const merged: Record<string, any> = { ...current }

  if (body.theme !== undefined) merged.theme = body.theme
  if (body.accentColor !== undefined) merged.accentColor = body.accentColor
  if (body.avatarId !== undefined) merged.avatarId = body.avatarId
  if (body.tables) {
    merged.tables = deepMergeTables(current.tables, body.tables)
  }

  await db.update(users)
    .set({ preferences: merged })
    .where(eq(users.id, session.userId))

  return merged
})
