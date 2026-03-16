/**
 * Composable to fetch active languages from DB.
 * Cached across navigations — languages rarely change.
 */
export function useLanguages() {
  const { data, status } = useAsyncData(
    'active-languages',
    () => $fetch<{ data: Array<{ id: number; code: string; name: string; nativeName: string | null }> }>(
      '/api/languages',
      { query: { active: 'true' } }
    )
  )

  const languages = computed(() => data.value?.data ?? [])
  const loading = computed(() => status.value === 'pending')

  function findByCode(code: string) {
    return languages.value.find(l => l.code === code)
  }

  function findById(id: number) {
    return languages.value.find(l => l.id === id)
  }

  return { languages, loading, findByCode, findById }
}
