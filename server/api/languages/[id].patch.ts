import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { languages } from '../../database/schema'

const updateLanguageSchema = z.object({
  code: z.string().min(2).max(10).optional(),
  name: z.string().min(1).max(100).optional(),
  nativeName: z.string().max(100).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional()
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readValidatedBody(event, updateLanguageSchema.parse)
  const db = useDb()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (body.code !== undefined) updateData.code = body.code
  if (body.name !== undefined) updateData.name = body.name
  if (body.nativeName !== undefined) updateData.nativeName = body.nativeName
  if (body.active !== undefined) updateData.active = body.active
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder

  if (Object.keys(updateData).length === 1) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const [updated] = await db.update(languages).set(updateData).where(eq(languages.id, id)).returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Language not found' })
  }

  return updated
})
