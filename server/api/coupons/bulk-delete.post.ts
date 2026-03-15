import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { coupons } from '~~/server/database/schema'

const schema = z.object({
  status: z.string().optional(),
  date: z.string().optional(),
  betSlipNo: z.string().optional()
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN', 'DEALER'])
  const body = await readValidatedBody(event, schema.parse)
  const db = useDb()

  const conditions = []
  if (body.status) conditions.push(eq(coupons.status, body.status as any))
  if (body.betSlipNo) conditions.push(eq(coupons.betSlipNo, body.betSlipNo))
  if (body.date) conditions.push(sql`${coupons.createdAt}::date = ${body.date}::date`)

  const where = conditions.length > 0 ? and(...conditions) : undefined
  const deleted = await db.delete(coupons).where(where)

  return { success: true }
})
