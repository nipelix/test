<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">{{ t('dashboard.manage_categories') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Market Types -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">{{ t('categories.market_types') }}</h2>
            <div class="flex gap-1.5">
              <UButton icon="i-lucide-plus" size="xs" variant="outline" @click="marketEditItem = null; marketModalOpen = true" />
              <UButton icon="i-lucide-refresh-cw" size="xs" variant="outline" @click="marketList.handleRefresh()" />
            </div>
          </div>
        </template>

        <div class="space-y-1 max-h-[60vh] overflow-y-auto">
          <div
            v-for="market in marketList.rows.value"
            :key="market.id"
            class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition"
            :class="selectedMarketId === market.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
            @click="selectedMarketId = market.id"
          >
            <div>
              <p class="text-sm font-medium">{{ market.name }}</p>
              <p class="text-xs text-muted">ID: {{ market.id }}</p>
            </div>
            <div class="flex gap-1">
              <UButton icon="i-lucide-link" size="xs" variant="ghost" @click.stop="openMarketMapping(market)" />
              <UButton icon="i-lucide-pencil" size="xs" variant="ghost" @click.stop="marketEditItem = market; marketModalOpen = true" />
              <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click.stop="deleteMarket(market.id)" />
            </div>
          </div>
          <p v-if="marketList.rows.value.length === 0" class="text-sm text-muted text-center py-4">
            {{ t('common.no_data') }}
          </p>
        </div>
      </UCard>

      <!-- Right: Selection Templates (for selected market) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">{{ t('categories.selection_templates') }}</h2>
            <div class="flex gap-1.5">
              <UButton icon="i-lucide-plus" size="xs" variant="outline" :disabled="!selectedMarketId" @click="selectionEditItem = null; selectionModalOpen = true" />
              <UButton icon="i-lucide-refresh-cw" size="xs" variant="outline" @click="refreshSelections" />
            </div>
          </div>
        </template>

        <div v-if="selectedMarketId" class="space-y-1 max-h-[60vh] overflow-y-auto">
          <div
            v-for="sel in selections"
            :key="sel.id"
            class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div>
              <p class="text-sm font-medium">{{ sel.name }}</p>
              <p class="text-xs text-muted">Sort: {{ sel.sortOrder }} | Group: {{ sel.groupId }}</p>
            </div>
            <div class="flex gap-1">
              <UButton icon="i-lucide-pencil" size="xs" variant="ghost" @click="selectionEditItem = sel; selectionModalOpen = true" />
              <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click="deleteSelection(sel.id)" />
            </div>
          </div>
          <p v-if="selections.length === 0" class="text-sm text-muted text-center py-4">
            {{ t('common.no_data') }}
          </p>
        </div>
        <div v-else class="text-center py-8 text-muted text-sm">
          {{ t('categories.select_market_first') }}
        </div>
      </UCard>
    </div>

    <!-- Modals -->
    <AdminEntityFormModal
      v-model:open="marketModalOpen"
      :item="marketEditItem"
      :title="marketEditItem ? t('categories.edit_market') : t('categories.add_market')"
      :fields="marketFields"
      endpoint="/api/market-types"
      @success="marketList.handleRefresh()"
    />

    <AdminEntityFormModal
      v-model:open="selectionModalOpen"
      :item="selectionEditItem"
      :title="selectionEditItem ? t('categories.edit_selection') : t('categories.add_selection')"
      :fields="selectionFields"
      endpoint="/api/selection-templates"
      @success="refreshSelections"
    />

    <!-- Mapping Slideover -->
    <AdminMappingSlideover
      v-model:open="mappingOpen"
      :entity-type="mappingEntityType"
      :entity-id="mappingEntityId"
      :entity-name="mappingEntityName"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })

const { t } = useI18n()
const toast = useToast()

const marketList = useEntityList<any>('/api/market-types', 'manage-categories-markets', [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: t('common.name') }
])

const selectedMarketId = ref<number | null>(null)

// Mapping slideover
const mappingOpen = ref(false)
const mappingEntityType = ref('MARKET_TYPE')
const mappingEntityId = ref<number | null>(null)
const mappingEntityName = ref('')

function openMarketMapping(market: any) {
  mappingEntityType.value = 'MARKET_TYPE'
  mappingEntityId.value = market.id
  mappingEntityName.value = market.name
  mappingOpen.value = true
}
const selections = ref<any[]>([])

const marketModalOpen = ref(false)
const marketEditItem = ref<any>(null)
const selectionModalOpen = ref(false)
const selectionEditItem = ref<any>(null)

const marketFields = [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'period', label: 'Period', type: 'text' as const },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' as const }
]

const selectionFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'marketTypeId', label: 'Market Type ID', type: 'number' as const, required: true },
  { key: 'groupId', label: 'Group ID', type: 'number' as const },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' as const }
])

async function refreshSelections() {
  if (!selectedMarketId.value) { selections.value = []; return }
  try {
    const res = await $fetch<{ data: any[] }>('/api/selection-templates', {
      query: { marketGroupId: selectedMarketId.value, limit: 200 }
    })
    selections.value = res.data
  } catch { selections.value = [] }
}

watch(selectedMarketId, () => refreshSelections())

async function deleteMarket(id: number) {
  try {
    await $fetch(`/api/market-types/${id}`, { method: 'DELETE' })
    toast.add({ title: t('modals.success_deleted'), color: 'success' })
    if (selectedMarketId.value === id) selectedMarketId.value = null
    marketList.handleRefresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  }
}

async function deleteSelection(id: number) {
  try {
    await $fetch(`/api/selection-templates/${id}`, { method: 'DELETE' })
    toast.add({ title: t('modals.success_deleted'), color: 'success' })
    refreshSelections()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  }
}
</script>
