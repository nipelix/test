import { readonly as vueReadonly } from 'vue'

// Maps entity types to their API base paths
const ENTITY_MAPPING_ENDPOINTS: Record<string, string> = {
  SPORT: '/api/sports/mappings',
  COUNTRY: '/api/countries/mappings',
  LEAGUE: '/api/leagues/mappings',
  MARKET_TYPE: '/api/market-types/mappings',
  SELECTION_TEMPLATE: '/api/selection-templates/mappings',
  BETTING_GROUP: '/api/betting-groups/mappings'
}

/**
 * Composable for per-entity provider mapping CRUD.
 * Uses entity-specific endpoints (not polymorphic).
 */
export function useInlineMapping(entityType: Ref<string>, entityId: Ref<number>) {
  const toast = useToast()
  const { t } = useI18n()

  const mappings = ref<any[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deletingId = ref<number | null>(null)
  const editingId = ref<number | null>(null)

  const newProviderId = ref<number | null>(null)
  const newExternalId = ref('')
  const editExternalId = ref('')

  const { data: providers } = useAsyncData('providers-global', () =>
    $fetch<{ data: any[] }>('/api/providers', { query: { limit: 100 } }).catch(() => ({ data: [] }))
  )

  const providerOptions = computed(() =>
    (providers.value?.data ?? []).map((p: any) => ({ label: p.name, value: p.id }))
  )

  const baseUrl = computed(() => ENTITY_MAPPING_ENDPOINTS[entityType.value] || '/api/sports/mappings')

  async function fetchMappings() {
    if (!entityId.value) { mappings.value = []; return }
    loading.value = true
    try {
      const res = await $fetch<{ data: any[] }>(baseUrl.value, {
        query: { entityId: entityId.value }
      })
      mappings.value = res.data ?? []
    } catch { mappings.value = [] }
    finally { loading.value = false }
  }

  watch(entityId, () => fetchMappings(), { immediate: true })

  async function handleAdd() {
    if (!entityId.value || !newProviderId.value || !newExternalId.value) return
    saving.value = true
    try {
      await $fetch(baseUrl.value, {
        method: 'POST',
        body: { entityId: entityId.value, providerId: newProviderId.value, externalId: Number(newExternalId.value) }
      })
      newExternalId.value = ''
      await fetchMappings()
    } catch (err: any) {
      toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
    } finally { saving.value = false }
  }

  function startEdit(mapping: any) {
    editingId.value = mapping.id
    editExternalId.value = String(mapping.externalId)
  }

  function cancelEdit() {
    editingId.value = null
    editExternalId.value = ''
  }

  async function handleSaveEdit(id: number) {
    if (!editExternalId.value) return
    saving.value = true
    try {
      await $fetch(`${baseUrl.value}/${id}`, {
        method: 'PATCH',
        body: { externalId: Number(editExternalId.value) }
      })
      cancelEdit()
      await fetchMappings()
    } catch (err: any) {
      toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
    } finally { saving.value = false }
  }

  async function handleDelete(id: number) {
    deletingId.value = id
    try {
      await $fetch(`${baseUrl.value}/${id}`, { method: 'DELETE' })
      mappings.value = mappings.value.filter(m => m.id !== id)
    } catch { toast.add({ title: t('common.error'), color: 'error' }) }
    finally { deletingId.value = null }
  }

  return {
    mappings: vueReadonly(mappings),
    loading: vueReadonly(loading),
    saving: vueReadonly(saving),
    deletingId: vueReadonly(deletingId),
    editingId, editExternalId,
    newProviderId, newExternalId, providerOptions,
    handleAdd, startEdit, cancelEdit, handleSaveEdit, handleDelete, fetchMappings
  }
}
