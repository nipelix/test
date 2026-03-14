import { eq, and } from 'drizzle-orm'
import { bettingSettings } from '../../database/schema'
import { z } from 'zod'

const upsertSettingSchema = z.object({
  value: z.any()
})

const VALID_KEYS = ['betting_limits', 'odds_limits', 'display_filter', 'features', 'time_settings']
const VALID_SCOPES = ['GLOBAL', 'ROLE', 'USER']

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

  if (!VALID_SCOPES.includes(scope)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid scope. Must be one of: ${VALID_SCOPES.join(', ')}` })
  }

  if (!VALID_KEYS.includes(key)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid key. Must be one of: ${VALID_KEYS.join(', ')}` })
  }

  const body = await readValidatedBody(event, upsertSettingSchema.parse)
  const db = useDb()

  // Check if setting exists
  const [existing] = await db.select()
    .from(bettingSettings)
    .where(and(
      eq(bettingSettings.scope, scope as any),
      eq(bettingSettings.scopeRef, scopeRef),
      eq(bettingSettings.key, key)
    ))

  let result
  if (existing) {
    [result] = await db.update(bettingSettings)
      .set({ value: body.value, updatedAt: new Date() })
      .where(eq(bettingSettings.id, existing.id))
      .returning()
  } else {
    [result] = await db.insert(bettingSettings)
      .values({
        scope: scope as any,
        scopeRef,
        key,
        value: body.value
      })
      .returning()
  }

  // Invalidate cached settings
  await invalidateCache('settings:resolved:*')

  return result
})
