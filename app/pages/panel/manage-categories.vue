<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_categories') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('categories.search_markets')"
          :add-label="t('categories.add_market')"
          :selected-count="selectedRows.length"
          show-add
          show-delete
          @create="editItem = null; modalOpen = true"
          @edit="openEdit"
          @refresh="handleRefresh"
          @activate="handleActivate"
          @deactivate="handleDeactivate"
          @delete="handleDelete"
          @update:search="searchQuery = $event"
        />

        <AdminDataTable
          :data="rows"
          :columns="filteredColumns"
          :loading="status === 'pending'"
          :selected-ids="selectedIds"
          :all-selected="allSelected"
          :some-selected="someSelected"
          :selected-count="selectedRows.length"
          :total="total"
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          expandable
          show-actions
          :row-actions="getRowActions"
          @toggle-row="toggleRow"
          @toggle-all="toggleAll"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event"
        >
          <template #expanded="{ row }">
            <div class="space-y-4 py-2">
              <!-- Inline Mapping -->
              <AdminInlineMappingRow entity-type="MARKET_TYPE" :entity-id="row.id" />

              <!-- Selection Templates Sub-table -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-semibold text-muted">{{ t('categories.selection_templates') }}</h4>
                  <UButton icon="i-lucide-plus" size="xs" variant="outline" @click="addSelection(row.id)">
                    {{ t('categories.add_selection') }}
                  </UButton>
                </div>
                <div v-if="selectionsCache[row.id]" class="border border-default rounded-md overflow-hidden">
                  <UTable
                    :data="selectionsCache[row.id] || []"
                    :columns="selectionColumns"
                    :ui="{ table: 'text-xs', th: 'py-1.5 px-2', td: 'py-1.5 px-2' }"
                  >
                    <template #actions-cell="{ row: selRow }">
                      <div class="flex gap-1">
                        <UButton icon="i-lucide-pencil" size="2xs" variant="ghost" @click="editSelection(selRow.original)" />
                        <UButton icon="i-lucide-trash-2" size="2xs" variant="ghost" color="error" @click="deleteSelection(selRow.original.id, row.id)" />
                      </div>
                    </template>
                  </UTable>
                  <p v-if="selectionsCache[row.id]?.length === 0" class="text-xs text-muted text-center py-3">{{ t('common.no_data') }}</p>
                </div>
                <USkeleton v-else class="h-16 rounded-md" />
              </div>
            </div>
          </template>
        </AdminDataTable>
      </div>
    </UCard>

    <!-- Market Form Modal -->
    <AdminEntityFormModal
      v-model:open="modalOpen"
      :item="editItem"
      :title="editItem ? t('categories.edit_market') : t('categories.add_market')"
      :fields="marketFields"
      endpoint="/api/market-types"
      @success="handleRefresh"
    />

    <!-- Selection Form Modal -->
    <AdminEntityFormModal
      v-model:open="selModalOpen"
      :item="selEditItem"
      :title="selEditItem ? t('categories.edit_selection') : t('categories.add_selection')"
      :fields="selectionFields"
      endpoint="/api/selection-templates"
      @success="refreshSelections"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })

const { t } = useI18n()
const toast = useToast()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'active', header: t('common.status') },
  { accessorKey: 'actions', header: '' }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, filteredColumns, bulkPatch, bulkDelete
} = useEntityList<any>('/api/market-types', 'manage-categories', columns)

const modalOpen = ref(false)
const editItem = ref<any>(null)

const marketFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'slug', label: 'Slug', type: 'text' as const },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' as const }
])

function openEdit() {
  if (selectedRows.value.length === 1) { editItem.value = selectedRows.value[0]; modalOpen.value = true }
}

function getRowActions(row: any) {
  return [
    [{ label: t('common.edit'), icon: 'i-lucide-pencil', click: () => { editItem.value = row; modalOpen.value = true } }],
    [{ label: t('common.delete'), icon: 'i-lucide-trash-2', color: 'error' as const, click: () => deleteSingle(row.id) }]
  ]
}

async function deleteSingle(id: number) {
  try { await $fetch(`/api/market-types/${id}`, { method: 'DELETE' }); handleRefresh() }
  catch { toast.add({ title: t('common.error'), color: 'error' }) }
}

async function handleActivate() { const { failed } = await bulkPatch({ active: true }); toast.add({ title: failed === 0 ? t('modals.success_updated') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }
async function handleDeactivate() { const { failed } = await bulkPatch({ active: false }); toast.add({ title: failed === 0 ? t('modals.success_updated') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }
async function handleDelete() { const { failed } = await bulkDelete(); toast.add({ title: failed === 0 ? t('modals.success_deleted') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }

// Selection sub-table
const selectionColumns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'groupId', header: 'Group' },
  { accessorKey: 'sortOrder', header: 'Sort' },
  { accessorKey: 'actions', header: '' }
]

const selectionsCache = reactive<Record<number, any[]>>({})
const selModalOpen = ref(false)
const selEditItem = ref<any>(null)
let activeMarketId = 0

const selectionFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'marketGroupId', label: 'Market ID', type: 'number' as const, required: true },
  { key: 'groupId', label: 'Group ID', type: 'number' as const },
  { key: 'sortOrder', label: 'Sort', type: 'number' as const }
])

watch(rows, (newRows) => {
  for (const row of newRows) {
    if (!(row.id in selectionsCache)) loadSelections(row.id)
  }
})

async function loadSelections(marketId: number) {
  try {
    const res = await $fetch<{ data: any[] }>('/api/selection-templates', { query: { marketGroupId: marketId, limit: 100 } })
    selectionsCache[marketId] = res.data ?? []
  } catch { selectionsCache[marketId] = [] }
}

function addSelection(marketId: number) {
  activeMarketId = marketId
  selEditItem.value = { marketGroupId: marketId }
  selModalOpen.value = true
}

function editSelection(sel: any) {
  activeMarketId = sel.marketGroupId
  selEditItem.value = sel
  selModalOpen.value = true
}

async function deleteSelection(id: number, marketId: number) {
  try {
    await $fetch(`/api/selection-templates/${id}`, { method: 'DELETE' })
    loadSelections(marketId)
  } catch { toast.add({ title: t('common.error'), color: 'error' }) }
}

function refreshSelections() {
  if (activeMarketId) loadSelections(activeMarketId)
}
</script>
