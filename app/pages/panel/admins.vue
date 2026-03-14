<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('admins.admin_list') }}</h1>
      </template>

      <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1.5">
      <UButton icon="i-lucide-plus-circle" variant="outline" color="neutral" size="sm" @click="createModalOpen = true">
        {{ t('admins.add_admin') }}
      </UButton>
      <UButton icon="i-lucide-user-pen" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length !== 1" @click="openEditModal">
        {{ t('admins.edit_admin') }}
      </UButton>
      <UButton icon="i-lucide-refresh-cw" variant="outline" color="neutral" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
      <UButton icon="i-lucide-check-circle-2" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('activate')">
        {{ t('common.activate') }}
      </UButton>
      <UButton icon="i-lucide-x-circle" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('deactivate')">
        {{ t('common.deactivate') }}
      </UButton>
      <UButton icon="i-lucide-trash-2" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('delete')">
        {{ t('admins.delete_admin') }}
      </UButton>
    </div>

    <!-- Search + Sort/View -->
    <div class="flex items-center justify-between gap-4">
      <UInput v-model="searchQuery" icon="i-lucide-search" :placeholder="t('admins.search_admins')" class="max-w-xs" />
      <div class="flex items-center gap-2">
        <AdminTableSortPopover :sorts="sorts" :sortable-columns="sortableColumns" :available-sort-columns="availableSortColumns"
          @add-sort="addSort" @remove-sort="removeSort" @update-sort-column="updateSortColumn" @update-sort-direction="updateSortDirection" @clear-sorts="clearSorts" />
        <AdminTableViewPopover :toggleable-columns="toggleableColumns" :visible-columns="visibleColumnKeys" @toggle-column="toggleColumn" />
      </div>
    </div>

    <!-- Table -->
    <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <UTable :data="paginatedData" :columns="filteredColumns" :loading="status === 'pending'">
        <template #select-cell="{ row }">
          <UCheckbox :model-value="selectedIds.has(row.original.id)" @update:model-value="toggleRow(row.original.id)" />
        </template>
        <template #select-header>
          <UCheckbox :model-value="allSelected" :indeterminate="someSelected" @update:model-value="toggleAll" />
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'active' ? 'success' : 'error'" variant="subtle" size="sm">
            {{ row.original.status === 'active' ? t('common.active') : t('common.inactive') }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
        </template>
      </UTable>

      <!-- Pagination Footer -->
      <div class="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
        <div class="flex items-center gap-3 text-sm text-gray-500">
          <select v-model="pageSize" class="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-transparent">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <span>{{ t('common.rows_selected', { count: selectedRows.length, total: filteredData.length }) }}</span>
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

    <!-- Modals -->
    <AdminUserCreateModal v-model:open="createModalOpen" role="ADMIN" @success="handleModalSuccess" />
    <AdminUserEditModal v-model:open="editModalOpen" :user="editUser" @success="handleModalSuccess" />
    <AdminConfirmActionModal v-model:open="confirmActionOpen" :action="confirmAction" :users="selectedRows" @success="handleModalSuccess" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })

const auth = useAuthStore()
const localePath = useLocalePath()

if (auth.user?.role !== 'SUPER_ADMIN') {
  await navigateTo(localePath('/panel'))
}

const { t } = useI18n()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedIds = ref(new Set<number>())

const createModalOpen = ref(false)
const editModalOpen = ref(false)
const confirmActionOpen = ref(false)
const confirmAction = ref<'activate' | 'deactivate' | 'delete'>('activate')

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'username', header: t('common.username') },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'createdAt', header: t('common.created_at') }
]

const { sorts, sortBy, sortDirection, addSort, removeSort, updateSortColumn, updateSortDirection, clearSorts, availableSortColumns, visibleColumnKeys, toggleColumn, filteredColumns, sortableColumns, toggleableColumns } = useTableStore('admins', columns, 'createdAt')

const queryParams = computed(() => ({
  role: 'ADMIN',
  page: currentPage.value,
  limit: pageSize.value,
  sortBy: sortBy.value,
  sortDirection: sortDirection.value,
  ...(searchQuery.value.trim() ? { search: searchQuery.value.trim() } : {})
}))

const { data: adminsData, refresh, status } = await useAsyncData(
  'admins-list',
  () => $fetch<{ data: any[], total: number }>('/api/users', { query: queryParams.value }),
  { watch: [queryParams] }
)

const allAdmins = computed(() => (adminsData.value?.data ?? []).map(a => ({
  ...a,
  status: a.status ? a.status.toLowerCase() : ''
})))

const filteredData = computed(() => allAdmins.value)
const totalPages = computed(() => Math.max(1, Math.ceil((adminsData.value?.total ?? 0) / pageSize.value)))
const paginatedData = computed(() => allAdmins.value)

const selectedRows = computed(() => allAdmins.value.filter(a => selectedIds.value.has(a.id)))
const editUser = computed(() => selectedRows.value.length === 1 ? selectedRows.value[0] : null)
const allSelected = computed(() => paginatedData.value.length > 0 && paginatedData.value.every(a => selectedIds.value.has(a.id)))
const someSelected = computed(() => !allSelected.value && paginatedData.value.some(a => selectedIds.value.has(a.id)))

function toggleAll() {
  if (allSelected.value) paginatedData.value.forEach(a => selectedIds.value.delete(a.id))
  else paginatedData.value.forEach(a => selectedIds.value.add(a.id))
}
function toggleRow(id: number) {
  selectedIds.value.has(id) ? selectedIds.value.delete(id) : selectedIds.value.add(id)
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function handleRefresh() { selectedIds.value.clear(); refresh() }
function handleModalSuccess() { selectedIds.value.clear(); refresh() }
function openEditModal() { if (selectedRows.value.length === 1) editModalOpen.value = true }
function openConfirmAction(action: 'activate' | 'deactivate' | 'delete') { confirmAction.value = action; confirmActionOpen.value = true }

watch(searchQuery, () => { currentPage.value = 1 })
watch(pageSize, () => { currentPage.value = 1 })
</script>
