import { eq, and } from 'drizzle-orm'
import { bettingSettings } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const path = getRouterParam(event, 'path')!
  const parts = path.split('/')

  if (parts.length !== 3) {
    throw createError({ statusCode: 400, statusMessage: 'Path must be /{scope}/{scopeRef}/{key}' })
  }

  const scope = parts[0]!
  const scopeRef = parts[1]!
  const key = parts[2]!
  const db = useDb()

  const [deleted] = await db.delete(bettingSettings)
    .where(and(
      eq(bettingSettings.scope, scope as any),
      eq(bettingSettings.scopeRef, scopeRef),
      eq(bettingSettings.key, key)
    ))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Setting not found' })
  }

  await invalidateCache('settings:resolved:*')

  return { ok: true }
})
