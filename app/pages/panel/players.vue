<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.players') }}</h1>
      </template>

      <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1.5">
      <UButton icon="i-lucide-plus-circle" variant="outline" color="neutral" size="sm" @click="createModalOpen = true">
        {{ t('players.add_user') }}
      </UButton>
      <UButton icon="i-lucide-user-pen" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length !== 1" @click="openEditModal">
        {{ t('players.edit_user') }}
      </UButton>
      <UButton icon="i-lucide-refresh-cw" variant="outline" color="neutral" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
      <UButton icon="i-lucide-plus-circle" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length !== 1" @click="openBalanceModal('deposit')">
        {{ t('players.add_balance') }}
      </UButton>
      <UButton icon="i-lucide-minus-circle" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length !== 1" @click="openBalanceModal('withdraw')">
        {{ t('players.remove_balance') }}
      </UButton>
      <UButton icon="i-lucide-check-circle-2" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('activate')">
        {{ t('common.activate') }}
      </UButton>
      <UButton icon="i-lucide-x-circle" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('deactivate')">
        {{ t('common.deactivate') }}
      </UButton>
      <UButton icon="i-lucide-trash-2" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0" @click="openConfirmAction('delete')">
        {{ t('common.delete') }}
      </UButton>
    </div>

    <!-- Search + Sort/View -->
    <div class="flex items-center justify-between gap-4">
      <UInput v-model="searchQuery" icon="i-lucide-search" :placeholder="t('players.search_users')" class="max-w-xs" />
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
        <template #balance-cell="{ row }">{{ formatCurrency(row.original.balance) }}</template>
        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="subtle" size="sm">
            {{ row.original.status === 'active' ? 'Active' : row.original.status === 'suspended' ? 'Suspended' : 'Inactive' }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">{{ row.original.createdAt ? formatDate(row.original.createdAt) : '-' }}</template>
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
    <AdminUserCreateModal v-model:open="createModalOpen" role="PLAYER" @success="handleModalSuccess" />
    <AdminUserEditModal v-model:open="editModalOpen" :user="editUser" @success="handleModalSuccess" />
    <AdminBalanceModal v-model:open="balanceModalOpen" :mode="balanceMode" :user-id="selectedRows.length === 1 ? selectedRows[0].id : null" :username="selectedRows.length === 1 ? selectedRows[0].username : ''" @success="handleModalSuccess" />
    <AdminConfirmActionModal v-model:open="confirmActionOpen" :action="confirmAction" :users="selectedRows" @success="handleModalSuccess" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'DEALER', 'SUB_DEALER'] })

const { t } = useI18n()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedIds = ref(new Set<number>())

const createModalOpen = ref(false)
const editModalOpen = ref(false)
const balanceModalOpen = ref(false)
const balanceMode = ref<'deposit' | 'withdraw'>('deposit')
const confirmActionOpen = ref(false)
const confirmAction = ref<'activate' | 'deactivate' | 'delete'>('activate')

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'adminUsername', header: 'Admin' },
  { accessorKey: 'dealerUsername', header: t('dealers.main_dealer') },
  { accessorKey: 'subDealerUsername', header: t('dealers.dealer') },
  { accessorKey: 'username', header: t('common.users') },
  { accessorKey: 'balance', header: t('common.balance') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'createdAt', header: t('players.membership_date') },
  { accessorKey: 'lastLoginIp', header: t('common.last_login_ip') },
  { accessorKey: 'lastLogin', header: t('common.last_login') }
]

const { sorts, sortBy, sortDirection, addSort, removeSort, updateSortColumn, updateSortDirection, clearSorts, availableSortColumns, visibleColumnKeys, toggleColumn, filteredColumns, sortableColumns, toggleableColumns } = useTableStore('players', columns, 'createdAt')

const queryParams = computed(() => ({
  role: 'PLAYER', page: currentPage.value, limit: pageSize.value,
  sortBy: sortBy.value, sortDirection: sortDirection.value,
  ...(searchQuery.value.trim() ? { search: searchQuery.value.trim() } : {})
}))

const { data: playersData, refresh, status } = await useAsyncData(
  'players-list',
  () => $fetch<{ data: any[], total: number }>('/api/users', { query: queryParams.value }),
  { watch: [queryParams] }
)

const allPlayers = computed(() => (playersData.value?.data ?? []).map(p => ({
  ...p, status: p.status ? p.status.toLowerCase() : '', balance: p.balance ?? 0,
  adminUsername: p.adminUsername ?? '-', dealerUsername: p.dealerUsername ?? '-', subDealerUsername: p.subDealerUsername ?? '-',
  lastLogin: p.lastLogin ?? null, lastLoginIp: p.lastLoginIp ?? '-'
})))

const filteredData = computed(() => allPlayers.value)
const totalPages = computed(() => Math.max(1, Math.ceil((playersData.value?.total ?? 0) / pageSize.value)))
const paginatedData = computed(() => allPlayers.value)
const selectedRows = computed(() => allPlayers.value.filter(p => selectedIds.value.has(p.id)))
const editUser = computed(() => selectedRows.value.length === 1 ? selectedRows.value[0] : null)
const allSelected = computed(() => paginatedData.value.length > 0 && paginatedData.value.every(p => selectedIds.value.has(p.id)))
const someSelected = computed(() => !allSelected.value && paginatedData.value.some(p => selectedIds.value.has(p.id)))

function toggleAll() { if (allSelected.value) paginatedData.value.forEach(p => selectedIds.value.delete(p.id)); else paginatedData.value.forEach(p => selectedIds.value.add(p.id)) }
function toggleRow(id: number) { selectedIds.value.has(id) ? selectedIds.value.delete(id) : selectedIds.value.add(id) }
function getStatusColor(status: string) { return status === 'active' ? 'success' as const : status === 'suspended' ? 'error' as const : 'neutral' as const }
function formatCurrency(value: number) { return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺' }
function formatDate(dateStr: string) { return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
function handleRefresh() { selectedIds.value.clear(); refresh() }
function handleModalSuccess() { selectedIds.value.clear(); refresh() }
function openEditModal() { if (selectedRows.value.length === 1) editModalOpen.value = true }
function openBalanceModal(mode: 'deposit' | 'withdraw') { balanceMode.value = mode; balanceModalOpen.value = true }
function openConfirmAction(action: 'activate' | 'deactivate' | 'delete') { confirmAction.value = action; confirmActionOpen.value = true }

watch(searchQuery, () => { currentPage.value = 1 })
watch(pageSize, () => { currentPage.value = 1 })
</script>
