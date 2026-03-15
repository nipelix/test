import { z } from 'zod'

const schema = z.object({
  conversationId: z.number().int().positive(),
  content: z.string().min(1).max(5000)
})

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readValidatedBody(event, schema.parse)
  return { success: true, conversationId: body.conversationId }
})
