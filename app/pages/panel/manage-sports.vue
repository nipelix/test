<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_sports') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('sports.search')"
          :add-label="t('sports.add_sport')"
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
              <AdminInlineMappingRow entity-type="SPORT" :entity-id="row.id" />

              <!-- Leagues Sub-table -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-semibold text-muted">{{ t('dashboard.manage_leagues') }}</h4>
                </div>
                <div v-if="leaguesCache[row.id]" class="border border-default rounded-md overflow-hidden">
                  <UTable
                    :data="leaguesCache[row.id] || []"
                    :columns="leagueColumns"
                    :ui="{ table: 'text-xs', th: 'py-1.5 px-2', td: 'py-1.5 px-2' }"
                  />
                  <p v-if="leaguesCache[row.id]?.length === 0" class="text-xs text-muted text-center py-3">{{ t('common.no_data') }}</p>
                </div>
                <USkeleton v-else class="h-16 rounded-md" />
              </div>
            </div>
          </template>
        </AdminDataTable>
      </div>
    </UCard>

    <AdminEntityFormModal
      v-model:open="modalOpen"
      :item="editItem"
      :title="editItem ? t('sports.edit_sport') : t('sports.add_sport')"
      :fields="formFields"
      endpoint="/api/sports"
      @success="handleRefresh"
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
} = useEntityList<any>('/api/sports', 'manage-sports', columns)

const modalOpen = ref(false)
const editItem = ref<any>(null)

const formFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'slug', label: 'Slug', type: 'text' as const, required: true }
])

function openEdit() {
  if (selectedRows.value.length === 1) {
    editItem.value = selectedRows.value[0]
    modalOpen.value = true
  }
}

function getRowActions(row: any) {
  return [
    [{ label: t('common.edit'), icon: 'i-lucide-pencil', click: () => { editItem.value = row; modalOpen.value = true } }],
    [
      { label: row.active ? t('common.deactivate') : t('common.activate'), icon: row.active ? 'i-lucide-x-circle' : 'i-lucide-check-circle-2', click: () => toggleActive(row) },
      { label: t('common.delete'), icon: 'i-lucide-trash-2', color: 'error' as const, click: () => deleteSingle(row.id) }
    ]
  ]
}

async function toggleActive(row: any) {
  try {
    await $fetch(`/api/sports/${row.id}`, { method: 'PATCH', body: { active: !row.active } })
    handleRefresh()
  } catch { toast.add({ title: t('common.error'), color: 'error' }) }
}

async function deleteSingle(id: number) {
  try {
    await $fetch(`/api/sports/${id}`, { method: 'DELETE' })
    handleRefresh()
  } catch { toast.add({ title: t('common.error'), color: 'error' }) }
}

async function handleActivate() {
  const { failed } = await bulkPatch({ active: true })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : t('common.error'), color: failed === 0 ? 'success' : 'warning' })
}

async function handleDeactivate() {
  const { failed } = await bulkPatch({ active: false })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : t('common.error'), color: failed === 0 ? 'success' : 'warning' })
}

async function handleDelete() {
  const { failed } = await bulkDelete()
  toast.add({ title: failed === 0 ? t('modals.success_deleted') : t('common.error'), color: failed === 0 ? 'success' : 'warning' })
}

// Leagues sub-table (lazy loaded on expand)
const leagueColumns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'active', header: t('common.status') }
]

const leaguesCache = reactive<Record<number, any[]>>({})

watch(() => [...selectedIds], () => {
  // Load leagues for newly expanded rows (DataTable manages expand internally)
}, { deep: true })

// Watch for rows to load leagues when expand is triggered
// DataTable emits no expand event, so we use a MutationObserver pattern:
// Instead, preload leagues for visible rows on first render
onMounted(async () => {
  // Leagues will be loaded reactively when expand slot renders
})

// Provide a method for template to trigger load
watch(rows, (newRows) => {
  for (const row of newRows) {
    if (!(row.id in leaguesCache)) {
      loadLeagues(row.id)
    }
  }
})

async function loadLeagues(sportId: number) {
  try {
    const res = await $fetch<{ data: any[] }>('/api/leagues', { query: { sportId, limit: 50 } })
    leaguesCache[sportId] = res.data ?? []
  } catch { leaguesCache[sportId] = [] }
}
</script>
