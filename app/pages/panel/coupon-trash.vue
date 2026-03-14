<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">{{ t('dashboard.coupon_trash') }}</h1>

    <!-- Filter Section -->
    <div class="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <USelectMenu
          :items="[{ label: 'All (Live + Pre-match)', value: 'all' }]"
          value-key="value"
          placeholder="All (Live + Pre-match)"
        >
          <template #leading>
            <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <USelectMenu
          :items="[{ label: 'Dealer Selection', value: '' }]"
          value-key="value"
          placeholder="Dealer Selection"
        >
          <template #leading>
            <UIcon name="i-lucide-user" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <USelectMenu
          :items="[{ label: 'Dealer Selection', value: '' }]"
          value-key="value"
          placeholder="Dealer Selection"
        >
          <template #leading>
            <UIcon name="i-lucide-users" class="w-4 h-4" />
          </template>
        </USelectMenu>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <USelectMenu
          :items="[{ label: 'Player Selection', value: '' }]"
          value-key="value"
          placeholder="Player Selection"
        >
          <template #leading>
            <UIcon name="i-lucide-user-round" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <USelectMenu
          :items="[{ label: 'Coupon Name', value: '' }]"
          value-key="value"
          placeholder="Coupon Name"
        >
          <template #leading>
            <UIcon name="i-lucide-ticket" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <USelectMenu
          :items="statusOptions"
          value-key="value"
          placeholder="Status"
        >
          <template #leading>
            <UIcon name="i-lucide-circle-dot" class="w-4 h-4" />
          </template>
        </USelectMenu>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <USelectMenu
          :items="[{ label: 'Date Range', value: '' }]"
          value-key="value"
          placeholder="Date Range"
        >
          <template #leading>
            <UIcon name="i-lucide-calendar" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <UButton color="primary" size="lg" class="w-full">
          Display
        </UButton>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1.5">
      <UButton icon="i-lucide-refresh-cw" variant="outline" color="neutral" size="sm" @click="refresh">
        {{ t('common.refresh') }}
      </UButton>
      <UButton icon="i-lucide-rotate-ccw" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length === 0">
        Restore
      </UButton>
      <UButton icon="i-lucide-file-text" variant="outline" color="neutral" size="sm">
        {{ t('common.details') }}
      </UButton>
      <UButton icon="i-lucide-x-circle" variant="outline" color="neutral" size="sm" @click="filterBy('cancelled')">
        {{ t('dashboard.cancelled_bets') }}
      </UButton>
      <UButton icon="i-lucide-trophy" variant="outline" color="neutral" size="sm" @click="filterBy('winning')">
        {{ t('dashboard.winning_bets') }}
      </UButton>
      <UButton icon="i-lucide-thumbs-down" variant="outline" color="neutral" size="sm" @click="filterBy('losing')">
        {{ t('dashboard.losing_bets') }}
      </UButton>
      <UButton icon="i-lucide-rotate-ccw" variant="outline" color="neutral" size="sm" @click="filterBy('refunded')">
        {{ t('dashboard.refunded_bets') }}
      </UButton>
      <UButton icon="i-lucide-list" variant="outline" color="neutral" size="sm" @click="filterBy('all')">
        {{ t('common.all') }}
      </UButton>
    </div>

    <!-- Search + Sort/View -->
    <div class="flex items-center justify-between gap-4">
      <div class="relative max-w-xs">
        <UIcon name="i-lucide-search" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('dashboard.search_coupons')"
          class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:border-primary"
        />
      </div>
      <div class="flex items-center gap-2">
        <AdminTableSortPopover :sorts="sorts" :sortable-columns="sortableColumns" :available-sort-columns="availableSortColumns"
          @add-sort="addSort" @remove-sort="removeSort" @update-sort-column="updateSortColumn" @update-sort-direction="updateSortDirection" @clear-sorts="clearSorts" />
        <AdminTableViewPopover :toggleable-columns="toggleableColumns" :visible-columns="visibleColumnKeys" @toggle-column="toggleColumn" />
      </div>
    </div>

    <!-- Table -->
    <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <UTable :data="paginatedData" :columns="filteredColumns">
        <template #select-cell="{ row }">
          <UCheckbox :model-value="selectedIds.has(row.original.id)" @update:model-value="toggleRow(row.original.id)" />
        </template>
        <template #select-header>
          <UCheckbox :model-value="allSelected" :indeterminate="someSelected" @update:model-value="toggleAll" />
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle" size="sm">{{ row.original.status }}</UBadge>
        </template>
        <template #tsMatches-cell="{ row }">
          {{ row.original.settledMatches }}/{{ row.original.totalMatches }}
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
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const toast = useToast()

function adaptCoupon(c: any) {
  return {
    id: c.id,
    betSlipNo: c.betSlipNo ?? '',
    status: c.status ? c.status.toLowerCase() : '',
    agent: '',
    subAgent: '',
    player: '',
    totalStake: parseFloat(c.stake ?? c.totalStake ?? '0'),
    potentialPayout: parseFloat(c.potentialPayout ?? '0'),
    totalOdds: parseFloat(c.totalOdds ?? '0'),
    credit: parseFloat(c.creditDeduction ?? c.credit ?? '0'),
    totalMatches: 0,
    settledMatches: 0,
    couponName: c.couponName ?? '',
    userIp: c.ipAddress ?? c.userIp ?? '',
    createdAt: c.createdAt ?? '',
    type: c.type ? c.type.toLowerCase() : ''
  }
}

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'agent', header: t('dashboard.agent') },
  { accessorKey: 'subAgent', header: t('dashboard.sub_agent') },
  { accessorKey: 'player', header: t('dashboard.player') },
  { accessorKey: 'totalStake', header: t('dashboard.total_stake') },
  { accessorKey: 'potentialPayout', header: t('dashboard.potential_payout') },
  { accessorKey: 'totalOdds', header: t('dashboard.total_odds') },
  { accessorKey: 'credit', header: t('common.credit') },
  { accessorKey: 'tsMatches', header: t('dashboard.ts_matches') },
  { accessorKey: 'couponName', header: t('dashboard.coupon_name') },
  { accessorKey: 'userIp', header: t('dashboard.user_ip') },
  { accessorKey: 'createdAt', header: t('common.time') },
  { accessorKey: 'betSlipNo', header: t('dashboard.bet_slip_no') }
]

const { sorts, sortBy, sortDirection, addSort, removeSort, updateSortColumn, updateSortDirection, clearSorts, availableSortColumns, visibleColumnKeys, toggleColumn, filteredColumns, sortableColumns, toggleableColumns } = useTableStore('coupon-trash', columns, 'createdAt')

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const activeFilter = ref('all')
const selectedIds = ref(new Set<number>())

const queryParams = computed(() => ({
  status: 'CANCELLED',
  page: currentPage.value,
  limit: pageSize.value,
  sortBy: sortBy.value,
  sortDirection: sortDirection.value
}))

const { data: trashData, refresh: refreshTrash } = await useAsyncData(
  'coupon-trash',
  () => $fetch<{ data: any[], total: number }>('/api/coupons', { query: queryParams.value }),
  { watch: [queryParams] }
)

const trashedCoupons = computed(() => (trashData.value?.data ?? []).map(adaptCoupon))

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Winning', value: 'winning' },
  { label: 'Losing', value: 'losing' },
  { label: 'Refunded', value: 'refunded' }
]

const filteredData = computed(() => {
  let result = [...trashedCoupons.value]
  if (activeFilter.value !== 'all') {
    result = result.filter(c => c.status === activeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.betSlipNo.toLowerCase().includes(q) ||
      c.player.toLowerCase().includes(q) ||
      c.agent.toLowerCase().includes(q) ||
      c.couponName.toLowerCase().includes(q)
    )
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil((trashData.value?.total ?? 0) / pageSize.value)))

const paginatedData = computed(() => filteredData.value)

const selectedRows = computed(() => filteredData.value.filter(c => selectedIds.value.has(c.id)))

const allSelected = computed(() => paginatedData.value.length > 0 && paginatedData.value.every(c => selectedIds.value.has(c.id)))
const someSelected = computed(() => !allSelected.value && paginatedData.value.some(c => selectedIds.value.has(c.id)))

function toggleAll() {
  if (allSelected.value) {
    paginatedData.value.forEach(c => selectedIds.value.delete(c.id))
  } else {
    paginatedData.value.forEach(c => selectedIds.value.add(c.id))
  }
}

function toggleRow(id: number) {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id)
  else selectedIds.value.add(id)
}

function statusColor(status: string) {
  const colors: Record<string, string> = { ongoing: 'blue', winning: 'green', losing: 'red', won: 'green', lost: 'red', refunded: 'warning', cancelled: 'neutral', deleted: 'neutral' }
  return colors[status] || 'neutral'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function filterBy(status: string) { activeFilter.value = status; currentPage.value = 1 }

function refresh() {
  activeFilter.value = 'all'
  searchQuery.value = ''
  selectedIds.value.clear()
  refreshTrash()
}

watch(searchQuery, () => { currentPage.value = 1 })
watch(pageSize, () => { currentPage.value = 1 })
</script>
