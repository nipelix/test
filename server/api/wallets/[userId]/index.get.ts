export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const userId = Number(getRouterParam(event, 'userId'))
  if (!userId || isNaN(userId)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  // Check access
  await requireTreeAccess(event, userId)

  const wallet = await getWalletByUserId(userId)

  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
  }

  return wallet
})
