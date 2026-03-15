import { readonly as vueReadonly } from 'vue'

/**
 * Composable for inline provider mapping CRUD.
 * Auto-fetches when entityId changes.
 */
export function useInlineMapping(entityType: Ref<string>, entityId: Ref<number>) {
  const toast = useToast()
  const { t } = useI18n()

  const mappings = ref<any[]>([])
  const loading = ref(false)
  const adding = ref(false)
  const deletingId = ref<number | null>(null)
  const newProviderId = ref<number | null>(null)
  const newExternalId = ref('')

  const { data: providers } = useAsyncData('providers-global', () =>
    $fetch<{ data: any[] }>('/api/providers', { query: { limit: 100 } }).catch(() => ({ data: [] }))
  )

  const providerOptions = computed(() =>
    (providers.value?.data ?? []).map((p: any) => ({ label: p.name, value: p.id }))
  )

  async function fetchMappings() {
    if (!entityId.value) { mappings.value = []; return }
    loading.value = true
    try {
      const res = await $fetch<{ data: any[] }>('/api/provider-mappings', {
        query: { entityType: entityType.value, entityId: entityId.value }
      })
      mappings.value = res.data ?? []
    } catch { mappings.value = [] }
    finally { loading.value = false }
  }

  watch(entityId, () => fetchMappings(), { immediate: true })

  async function handleAdd() {
    if (!entityId.value || !newProviderId.value || !newExternalId.value) return
    adding.value = true
    try {
      await $fetch('/api/provider-mappings', {
        method: 'POST',
        body: { entityType: entityType.value, entityId: entityId.value, providerId: newProviderId.value, externalId: newExternalId.value }
      })
      newExternalId.value = ''
      await fetchMappings()
    } catch (err: any) {
      toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
    } finally { adding.value = false }
  }

  async function handleDelete(id: number) {
    deletingId.value = id
    try {
      await $fetch(`/api/provider-mappings/${id}`, { method: 'DELETE' })
      mappings.value = mappings.value.filter(m => m.id !== id)
    } catch { toast.add({ title: t('common.error'), color: 'error' }) }
    finally { deletingId.value = null }
  }

  return {
    mappings: vueReadonly(mappings),
    loading: vueReadonly(loading),
    adding: vueReadonly(adding),
    deletingId: vueReadonly(deletingId),
    newProviderId, newExternalId, providerOptions,
    handleAdd, handleDelete, fetchMappings
  }
}
