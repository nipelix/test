import { creditRanges } from '../../database/schema'
import { z } from 'zod'

const creditRangeItemSchema = z.object({
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  creditDeduction: z.number().min(0),
  active: z.boolean().optional().default(true)
})

const updateCreditRangesSchema = z.object({
  ranges: z.array(creditRangeItemSchema).min(1)
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN', 'ADMIN'])

  const body = await readValidatedBody(event, updateCreditRangesSchema.parse)
  const db = useDb()

  // Replace all ranges in a transaction
  const result = await db.transaction(async (tx) => {
    // Delete all existing ranges
    await tx.delete(creditRanges)

    // Insert new ranges
    const inserted = []
    for (const range of body.ranges) {
      const [row] = await tx.insert(creditRanges).values({
        minAmount: String(range.minAmount),
        maxAmount: String(range.maxAmount),
        creditDeduction: String(range.creditDeduction),
        active: range.active
      }).returning()
      inserted.push(row)
    }

    return inserted
  })

  return { data: result }
})
