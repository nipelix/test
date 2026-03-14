import { bettingGroups } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])

  const body = await readValidatedBody(event, createBettingGroupSchema.parse)
  const db = useDb()

  const [group] = await db.insert(bettingGroups).values({
    name: body.name,
    sportId: body.sportId,
    active: body.active,
    sortOrder: body.sortOrder
  }).returning()

  setResponseStatus(event, 201)
  return group
})
