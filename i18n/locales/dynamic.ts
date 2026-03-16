import trFallback from './tr.json'

export default defineI18nLocale(async (locale) => {
  try {
    const overrides = await $fetch(`/api/i18n/overrides/${locale}`)
    // Aktif dil, override var → TR fallback + override merge (override kazanır)
    const { defu } = await import('defu')
    return defu(overrides, trFallback)
  } catch {
    // Dil aktif değil veya override yok → sadece TR fallback
    return trFallback
  }
})
