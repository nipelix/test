import { z } from 'zod'
import { languages } from '../../database/schema'

const createLanguageSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  nativeName: z.string().max(100).optional(),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0)
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createLanguageSchema.parse)
  const db = useDb()

  const [language] = await db.insert(languages).values({
    code: body.code,
    name: body.name,
    nativeName: body.nativeName || null,
    active: body.active,
    sortOrder: body.sortOrder
  }).returning()

  setResponseStatus(event, 201)
  return language
})
