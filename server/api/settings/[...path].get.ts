import { eq, and } from 'drizzle-orm'
import { bettingSettings } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const path = getRouterParam(event, 'path')!
  const parts = path.split('/')

  if (parts.length !== 2) {
    throw createError({ statusCode: 400, statusMessage: 'Path must be /{scope}/{scopeRef}' })
  }

  const scope = parts[0]!
  const scopeRef = parts[1]!
  const db = useDb()

  const rows = await db.select()
    .from(bettingSettings)
    .where(and(
      eq(bettingSettings.scope, scope as any),
      eq(bettingSettings.scopeRef, scopeRef)
    ))

  const result: Record<string, any> = {}
  for (const row of rows) {
    result[row.key] = row.value
  }

  return { scope, scopeRef, settings: result }
})
