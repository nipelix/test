import { providers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createProviderSchema.parse)
  const db = useDb()

  const [provider] = await db.insert(providers).values({
    name: body.name,
    slug: body.slug,
    active: body.active
  }).returning()

  setResponseStatus(event, 201)
  return provider
})
