export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const wallet = await getWalletByUserId(session.userId)

  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
  }

  return wallet
})
