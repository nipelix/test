<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.agent_list') }}</h1>
      </template>

      <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1.5">
      <UButton icon="i-lucide-plus-circle" variant="outline" color="neutral" size="sm" @click="createModalOpen = true">
        {{ t('agents.add_agent') }}
      </UButton>
      <UButton icon="i-lucide-user-pen" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length !== 1" @click="openEditModal">
        {{ t('agents.edit_agent') }}
      </UButton>
      <UButton icon="i-lucide-refresh-cw" variant="outline" color="neutral" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
      <UButton icon="i-lucide-plus-circle" variant="outline" color="neutral" size="sm" @click="openCreditModal">
        {{ t('dashboard.add_credit') }}
      </UButton>
      <UButton icon="i-lucide-check-circle-2" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('activate')">
        {{ t('common.activate') }}
      </UButton>
      <UButton icon="i-lucide-x-circle" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('deactivate')">
        {{ t('common.deactivate') }}
      </UButton>
      <UButton icon="i-lucide-trash-2" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('delete')">
        {{ t('agents.delete_agent') }}
      </UButton>
    </div>

    <!-- Search + Sort/View -->
    <div class="flex items-center justify-between gap-4">
      <UInput v-model="searchQuery" icon="i-lucide-search" :placeholder="t('agents.search_agents')" class="max-w-xs" />
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
            {{ row.original.status === 'active' ? 'Active' : 'Inactive' }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">{{ formatDate(row.original.createdAt) }}</template>
        <template #lastLogin-cell="{ row }">{{ row.original.lastLogin ? formatDate(row.original.lastLogin) : '-' }}</template>
      </UTable>

      <!-- Pagination Footer -->
      <div class="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
        <div class="flex items-center gap-3 text-sm text-gray-500">
          <select v-model="pageSize" class="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-transparent">
            <option :value="10">10</option><option :value="20">20</option><option :value="50">50</option>
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
    <AdminUserCreateModal v-model:open="createModalOpen" role="AGENT" @success="handleModalSuccess" />
    <AdminUserEditModal v-model:open="editModalOpen" :user="editUser" @success="handleModalSuccess" />
    <AdminCreditModal v-model:open="creditModalOpen" :all-users="allAgents" :pre-selected-ids="selectedRows.map(r => r.id)" :label="t('dashboard.agent')" @success="handleModalSuccess" />
    <AdminConfirmActionModal v-model:open="confirmActionOpen" :action="confirmAction" :users="selectedRows" @success="handleModalSuccess" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] })

const { t } = useI18n()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedIds = ref(new Set<number>())

const createModalOpen = ref(false)
const editModalOpen = ref(false)
const creditModalOpen = ref(false)
const confirmActionOpen = ref(false)
const confirmAction = ref<'activate' | 'deactivate' | 'delete'>('activate')

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'adminUsername', header: 'Admin' },
  { accessorKey: 'username', header: t('dashboard.agent') },
  { accessorKey: 'credit', header: t('common.credit') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'createdAt', header: t('agents.membership_date') },
  { accessorKey: 'lastLoginIp', header: t('common.last_login_ip') },
  { accessorKey: 'lastLogin', header: t('common.last_login') }
]

const { sorts, sortBy, sortDirection, addSort, removeSort, updateSortColumn, updateSortDirection, clearSorts, availableSortColumns, visibleColumnKeys, toggleColumn, filteredColumns, sortableColumns, toggleableColumns } = useTableStore('agents', columns, 'createdAt')

const queryParams = computed(() => ({
  role: 'AGENT', page: currentPage.value, limit: pageSize.value,
  sortBy: sortBy.value, sortDirection: sortDirection.value,
  ...(searchQuery.value.trim() ? { search: searchQuery.value.trim() } : {})
}))

const { data: agentsData, refresh, status } = await useAsyncData(
  'agents-list',
  () => $fetch<{ data: any[], total: number }>('/api/users', { query: queryParams.value }),
  { watch: [queryParams] }
)

const allAgents = computed(() => (agentsData.value?.data ?? []).map(a => ({
  ...a, status: a.status ? a.status.toLowerCase() : '', credit: a.credit ?? 0,
  adminUsername: a.adminUsername ?? '-', lastLogin: a.lastLogin ?? null, lastLoginIp: a.lastLoginIp ?? '-'
})))

const filteredData = computed(() => allAgents.value)
const totalPages = computed(() => Math.max(1, Math.ceil((agentsData.value?.total ?? 0) / pageSize.value)))
const paginatedData = computed(() => allAgents.value)
const selectedRows = computed(() => allAgents.value.filter(a => selectedIds.value.has(a.id)))
const editUser = computed(() => selectedRows.value.length === 1 ? selectedRows.value[0] : null)
const allSelected = computed(() => paginatedData.value.length > 0 && paginatedData.value.every(a => selectedIds.value.has(a.id)))
const someSelected = computed(() => !allSelected.value && paginatedData.value.some(a => selectedIds.value.has(a.id)))

function toggleAll() { if (allSelected.value) paginatedData.value.forEach(a => selectedIds.value.delete(a.id)); else paginatedData.value.forEach(a => selectedIds.value.add(a.id)) }
function toggleRow(id: number) { selectedIds.value.has(id) ? selectedIds.value.delete(id) : selectedIds.value.add(id) }
function formatDate(dateStr: string) { return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
function handleRefresh() { selectedIds.value.clear(); refresh() }
function handleModalSuccess() { selectedIds.value.clear(); refresh() }
function openEditModal() { if (selectedRows.value.length === 1) editModalOpen.value = true }
function openCreditModal() { creditModalOpen.value = true }
function openConfirmAction(action: 'activate' | 'deactivate' | 'delete') { confirmAction.value = action; confirmActionOpen.value = true }

watch(searchQuery, () => { currentPage.value = 1 })
watch(pageSize, () => { currentPage.value = 1 })
</script>
