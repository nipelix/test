import { creditRanges } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const db = useDb()
  const data = await db.select().from(creditRanges).orderBy(creditRanges.minAmount)

  return { data }
})
