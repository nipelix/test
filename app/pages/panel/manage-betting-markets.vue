<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">{{ t('dashboard.manage_betting_markets') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Markets Column -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">{{ t('markets.betting_markets') }}</h2>
            <div class="flex gap-1.5">
              <UButton icon="i-lucide-plus" size="xs" variant="outline" @click="marketEditItem = null; marketModalOpen = true" />
              <UButton icon="i-lucide-refresh-cw" size="xs" variant="outline" @click="marketList.handleRefresh()" />
            </div>
          </div>
        </template>

        <UInput v-model="marketSearch" icon="i-lucide-search" :placeholder="t('markets.search')" size="sm" class="mb-3" />

        <div class="space-y-1 max-h-[55vh] overflow-y-auto">
          <div
            v-for="market in filteredMarkets"
            :key="market.id"
            class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition"
            :class="selectedMarketId === market.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'"
            @click="selectedMarketId = market.id"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">{{ market.name }}</p>
              <p class="text-xs text-muted">Sort: {{ market.sortOrder ?? '-' }}</p>
            </div>
            <div class="flex gap-1 shrink-0">
              <UButton icon="i-lucide-pencil" size="xs" variant="ghost" @click.stop="marketEditItem = market; marketModalOpen = true" />
              <UButton icon="i-lucide-link" size="xs" variant="ghost" @click.stop="openMapping('MARKET', market)" />
              <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click.stop="deleteMarket(market.id)" />
            </div>
          </div>
          <p v-if="filteredMarkets.length === 0" class="text-sm text-muted text-center py-4">{{ t('common.no_data') }}</p>
        </div>
      </UCard>

      <!-- Selections Column -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">{{ t('markets.selections') }}</h2>
            <div class="flex gap-1.5">
              <UButton icon="i-lucide-plus" size="xs" variant="outline" :disabled="!selectedMarketId" @click="selEditItem = null; selModalOpen = true" />
              <UButton icon="i-lucide-refresh-cw" size="xs" variant="outline" @click="loadSelections" />
            </div>
          </div>
        </template>

        <div v-if="selectedMarketId" class="space-y-1 max-h-[55vh] overflow-y-auto">
          <div
            v-for="sel in selections"
            :key="sel.id"
            class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">{{ sel.name }}</p>
              <p class="text-xs text-muted">Hash: {{ sel.hashId ?? sel.id }}</p>
            </div>
            <div class="flex gap-1 shrink-0">
              <UButton icon="i-lucide-pencil" size="xs" variant="ghost" @click="selEditItem = sel; selModalOpen = true" />
              <UButton icon="i-lucide-link" size="xs" variant="ghost" @click="openMapping('SELECTION', sel)" />
              <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click="deleteSelection(sel.id)" />
            </div>
          </div>
          <p v-if="selections.length === 0" class="text-sm text-muted text-center py-4">{{ t('common.no_data') }}</p>
        </div>
        <div v-else class="text-center py-8 text-muted text-sm">{{ t('markets.select_market_first') }}</div>
      </UCard>
    </div>

    <!-- Modals -->
    <AdminEntityFormModal v-model:open="marketModalOpen" :item="marketEditItem" :title="marketEditItem ? t('markets.edit') : t('markets.add')" :fields="marketFields" endpoint="/api/market-types" @success="marketList.handleRefresh()" />
    <AdminEntityFormModal v-model:open="selModalOpen" :item="selEditItem" :title="selEditItem ? t('markets.edit_selection') : t('markets.add_selection')" :fields="selFields" endpoint="/api/selection-templates" @success="loadSelections" />
    <AdminMappingDialog v-model:open="mappingOpen" :entity-type="mappingEntityType" :entity-id="mappingEntityId" :entity-name="mappingEntityName" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] })

const { t } = useI18n()
const toast = useToast()

// Markets
const marketList = useEntityList<any>('/api/market-types', 'betting-markets', [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: t('common.name') }
])

const marketSearch = ref('')
const selectedMarketId = ref<number | null>(null)
const marketModalOpen = ref(false)
const marketEditItem = ref<any>(null)

const filteredMarkets = computed(() => {
  if (!marketSearch.value.trim()) return marketList.rows.value
  const q = marketSearch.value.toLowerCase()
  return marketList.rows.value.filter((m: any) => m.name?.toLowerCase().includes(q))
})

const marketFields = [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'period', label: 'Period', type: 'text' as const },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' as const }
]

async function deleteMarket(id: number) {
  try {
    await $fetch(`/api/market-types/${id}`, { method: 'DELETE' })
    if (selectedMarketId.value === id) selectedMarketId.value = null
    marketList.handleRefresh()
    toast.add({ title: t('modals.success_deleted'), color: 'success' })
  } catch (err: any) { toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' }) }
}

// Selections
const selections = ref<any[]>([])
const selModalOpen = ref(false)
const selEditItem = ref<any>(null)

const selFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'marketTypeId', label: 'Market Type ID', type: 'number' as const, required: true },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' as const }
])

async function loadSelections() {
  if (!selectedMarketId.value) { selections.value = []; return }
  try {
    const res = await $fetch<{ data: any[] }>('/api/selection-templates', { query: { marketGroupId: selectedMarketId.value, limit: 200 } })
    selections.value = res.data ?? []
  } catch { selections.value = [] }
}

watch(selectedMarketId, () => loadSelections())

async function deleteSelection(id: number) {
  try {
    await $fetch(`/api/selection-templates/${id}`, { method: 'DELETE' })
    toast.add({ title: t('modals.success_deleted'), color: 'success' })
    loadSelections()
  } catch (err: any) { toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' }) }
}

// Mapping dialog
const mappingOpen = ref(false)
const mappingEntityType = ref<'MARKET' | 'SELECTION'>('MARKET')
const mappingEntityId = ref<number | null>(null)
const mappingEntityName = ref('')

function openMapping(type: 'MARKET' | 'SELECTION', item: any) {
  mappingEntityType.value = type
  mappingEntityId.value = item.id
  mappingEntityName.value = item.name
  mappingOpen.value = true
}
</script>
