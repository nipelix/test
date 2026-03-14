<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_sports') }}</h1>
      </template>

      <div class="space-y-4">
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-1.5">
          <UButton icon="i-lucide-user-pen" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length !== 1" @click="openEditSport(selectedRows[0])">
            {{ t('common.edit') }}
          </UButton>
          <UButton icon="i-lucide-refresh-cw" variant="outline" color="neutral" size="sm" @click="handleRefresh">
            {{ t('common.refresh') }}
          </UButton>
          <UButton icon="i-lucide-check-circle-2" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="bulkToggleActive(true)">
            {{ t('common.activate') }}
          </UButton>
          <UButton icon="i-lucide-x-circle" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="bulkToggleActive(false)">
            {{ t('common.deactivate') }}
          </UButton>
          <UButton icon="i-lucide-trash-2" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="bulkDelete">
            {{ t('common.delete') }}
          </UButton>
        </div>

        <!-- Search + Sort/View -->
        <div class="flex items-center justify-between gap-4">
          <UInput v-model="searchQuery" icon="i-lucide-search" :placeholder="t('common.search') + '...'" class="max-w-xs" />
          <div class="flex items-center gap-2">
            <AdminTableSortPopover :sorts="sorts" :sortable-columns="sortableColumns" :available-sort-columns="availableSortColumns"
              @add-sort="addSort" @remove-sort="removeSort" @update-sort-column="updateSortColumn" @update-sort-direction="updateSortDirection" @clear-sorts="clearSorts" />
            <AdminTableViewPopover :toggleable-columns="toggleableColumns" :visible-columns="visibleColumnKeys" @toggle-column="toggleColumn" />
          </div>
        </div>

        <!-- Table -->
        <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <UTable :data="tableData" :columns="filteredColumns" :loading="status === 'pending'">
            <template #select-cell="{ row }">
              <UCheckbox :model-value="selectedIds.has(row.original.id)" @update:model-value="toggleRow(row.original.id)" />
            </template>
            <template #select-header>
              <UCheckbox :model-value="allSelected" :indeterminate="someSelected" @update:model-value="toggleAll" />
            </template>
            <template #name-cell="{ row }">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UIcon :name="row.original.icon || 'i-lucide-circle'" class="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p class="font-medium">{{ row.original.name }}</p>
                  <p class="text-xs text-gray-500">{{ row.original.slug }}</p>
                </div>
              </div>
            </template>
            <template #active-cell="{ row }">
              <UBadge :color="row.original.active ? 'success' : 'neutral'" variant="subtle" size="sm">
                {{ row.original.active ? t('common.active') : t('common.passive') }}
              </UBadge>
            </template>
            <template #sortOrder-cell="{ row }">
              {{ row.original.sortOrder }}
            </template>
          </UTable>

          <!-- Pagination Footer -->
          <div class="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <select v-model="pageSize" class="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-transparent">
                <option :value="10">10</option><option :value="20">20</option><option :value="50">50</option>
              </select>
              <span>{{ t('common.rows_selected', { count: selectedRows.length, total }) }}</span>
            </div>
            <div class="flex items-center gap-1 text-sm">
              <span class="mr-2 text-gray-500">{{ t('common.page_of', { page: currentPage, pages: totalPages }) }}</span>
              <UButton icon="i-lucide-chevrons-left" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1" @click="currentPage = 1" />
              <UButton icon="i-lucide-chevron-left" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1" @click="currentPage--" />
              <UButton icon="i-lucide-chevron-right" variant="outline" color="neutral" size="xs" :disabled="currentPage === totalPages" @click="currentPage++" />
              <UButton icon="i-lucide-chevrons-right" variant="outline" color="neutral" size="xs" :disabled="currentPage === totalPages" @click="currentPage = totalPages" />
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Edit Modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ t('common.edit') }} - {{ editingSport?.name }}</h3>
              <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="showModal = false" />
            </div>
          </template>

          <div class="space-y-4">
            <UFormField :label="t('common.name')">
              <UInput v-model="editForm.name" class="w-full" />
            </UFormField>
            <UFormField label="Slug">
              <UInput v-model="editForm.slug" class="w-full" />
            </UFormField>
            <UFormField :label="t('dashboard.sort_order')">
              <UInput v-model.number="editForm.sortOrder" type="number" class="w-full" />
            </UFormField>
            <div class="flex items-center gap-2">
              <USwitch v-model="editForm.active" />
              <span class="text-sm">{{ t('common.active') }}</span>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="outline" color="neutral" @click="showModal = false">{{ t('common.cancel') }}</UButton>
              <UButton color="primary" @click="saveSport">{{ t('common.save') }}</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t, locale } = useI18n()
const toast = useToast()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedIds = ref(new Set<number>())

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'active', header: t('common.active') },
  { accessorKey: 'sortOrder', header: t('dashboard.sort_order') }
]

const { sorts, sortBy, sortDirection, addSort, removeSort, updateSortColumn, updateSortDirection, clearSorts, availableSortColumns, visibleColumnKeys, toggleColumn, filteredColumns, sortableColumns, toggleableColumns } = useTableStore('manage-sports', columns, 'sortOrder')

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  lang: locale.value,
  sortBy: sortBy.value,
  sortDirection: sortDirection.value,
  ...(searchQuery.value.trim() ? { search: searchQuery.value.trim() } : {})
}))

const { data: sportsData, refresh, status } = await useAsyncData(
  'manage-sports',
  () => $fetch<{ data: any[], total: number }>('/api/sports', { query: queryParams.value }),
  { watch: [queryParams] }
)

const tableData = computed(() => sportsData.value?.data ?? [])
const total = computed(() => sportsData.value?.total ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const selectedRows = computed(() => tableData.value.filter(p => selectedIds.value.has(p.id)))
const allSelected = computed(() => tableData.value.length > 0 && tableData.value.every(p => selectedIds.value.has(p.id)))
const someSelected = computed(() => !allSelected.value && tableData.value.some(p => selectedIds.value.has(p.id)))

function toggleAll() { if (allSelected.value) tableData.value.forEach(p => selectedIds.value.delete(p.id)); else tableData.value.forEach(p => selectedIds.value.add(p.id)) }
function toggleRow(id: number) { selectedIds.value.has(id) ? selectedIds.value.delete(id) : selectedIds.value.add(id) }

async function bulkToggleActive(val: boolean) {
  try {
    await Promise.allSettled(selectedRows.value.map(s =>
      $fetch(`/api/sports/${s.id}`, { method: 'PATCH', body: { active: val } })
    ))
    selectedIds.value.clear()
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  }
}

async function bulkDelete() {
  try {
    await Promise.allSettled(selectedRows.value.map(s =>
      $fetch(`/api/sports/${s.id}`, { method: 'DELETE' })
    ))
    selectedIds.value.clear()
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  }
}

// Edit modal
const showModal = ref(false)
const editingSport = ref<any>(null)
const editForm = reactive({ name: '', slug: '', sortOrder: 0, active: true })

function openEditSport(sport: any) {
  editingSport.value = sport
  Object.assign(editForm, { name: sport.name, slug: sport.slug, sortOrder: sport.sortOrder, active: sport.active })
  showModal.value = true
}

async function saveSport() {
  if (!editingSport.value) return
  try {
    await $fetch(`/api/sports/${editingSport.value.id}`, {
      method: 'PATCH',
      body: { name: editForm.name, slug: editForm.slug, sortOrder: editForm.sortOrder, active: editForm.active }
    })
    showModal.value = false
    selectedIds.value.clear()
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  }
}

function handleRefresh() {
  searchQuery.value = ''
  currentPage.value = 1
  selectedIds.value.clear()
  refresh()
}

watch(searchQuery, () => { currentPage.value = 1 })
watch(pageSize, () => { currentPage.value = 1 })
</script>
