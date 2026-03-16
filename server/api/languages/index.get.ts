import { eq, asc } from 'drizzle-orm'
import { languages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const activeOnly = query.active !== 'false'

  const db = useDb()

  const conditions = activeOnly ? eq(languages.active, true) : undefined

  const data = await db.select().from(languages)
    .where(conditions)
    .orderBy(asc(languages.sortOrder))

  return { data }
})
