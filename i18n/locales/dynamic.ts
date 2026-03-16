import trFallback from './tr.json'

export default defineI18nLocale(async (locale) => {
  // TR her zaman çalışır — master fallback
  if (locale === 'tr') return trFallback

  try {
    // DB'de aktif mi kontrol + override'ları çek (404 = aktif değil)
    const overrides = await $fetch(`/api/i18n/overrides/${locale}`)
    // Aktif dil → override + TR fallback merge
    const { defu } = await import('defu')
    return defu(overrides, trFallback)
  } catch (err: any) {
    // 404 = dil aktif değil → hata fırlat, sayfa 404 düşsün
    if (err?.statusCode === 404 || err?.status === 404) {
      throw createError({ statusCode: 404, statusMessage: `Language '${locale}' is not available` })
    }
    // Diğer hatalar (DB bağlantı vb.) → TR fallback
    return trFallback
  }
})
