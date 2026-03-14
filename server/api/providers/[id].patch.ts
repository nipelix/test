import { eq } from 'drizzle-orm'
import { providers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readValidatedBody(event, updateProviderSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.slug !== undefined) updateData.slug = body.slug
  if (body.active !== undefined) updateData.active = body.active

  if (Object.keys(updateData).length === 1) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const [updated] = await db.update(providers).set(updateData).where(eq(providers.id, id)).returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Provider not found' })
  }

  return updated
})
