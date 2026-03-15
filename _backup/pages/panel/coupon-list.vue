<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-maximize-2" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.bet_slip_list') }}</h1>
    </div>

    <!-- Accordion Filters -->
    <UAccordion :items="accordionItems" multiple>
      <template #body="{ item }">
        <div v-if="item.value === 'filters'" class="space-y-4 p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormField :label="t('dashboard.agent')">
              <UInput placeholder="Agent..." />
            </UFormField>
            <UFormField :label="t('dashboard.sub_agent')">
              <UInput placeholder="Sub-Agent..." />
            </UFormField>
            <UFormField :label="t('dashboard.player')">
              <UInput placeholder="Player..." />
            </UFormField>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormField :label="t('common.status')">
              <USelectMenu
                v-model="filterStatus"
                :items="statusOptions"
                placeholder="Select status"
              />
            </UFormField>
            <UFormField :label="t('common.date')">
              <UInput type="date" />
            </UFormField>
            <UFormField label="Bet Slip No">
              <UInput placeholder="BSN-..." />
            </UFormField>
          </div>
          <div class="flex justify-end">
            <UButton color="primary" icon="i-lucide-search">{{ t('common.search') }}</UButton>
          </div>
        </div>
        <div v-else-if="item.value === 'single'" class="p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('common.total') }}</p>
              <p class="text-lg font-bold">{{ singleStats.total }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.winning') }}</p>
              <p class="text-lg font-bold text-green-600">{{ singleStats.winning }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.losing') }}</p>
              <p class="text-lg font-bold text-red-600">{{ singleStats.losing }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.total_stake') }}</p>
              <p class="text-lg font-bold">{{ singleStats.totalStake }} TL</p>
            </div>
          </div>
        </div>
        <div v-else-if="item.value === 'combined'" class="p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('common.total') }}</p>
              <p class="text-lg font-bold">{{ combinedStats.total }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.winning') }}</p>
              <p class="text-lg font-bold text-green-600">{{ combinedStats.winning }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.losing') }}</p>
              <p class="text-lg font-bold text-red-600">{{ combinedStats.losing }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.total_stake') }}</p>
              <p class="text-lg font-bold">{{ combinedStats.totalStake }} TL</p>
            </div>
          </div>
        </div>
        <div v-else-if="item.value === 'total'" class="p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('common.total') }}</p>
              <p class="text-lg font-bold">{{ totalStats.total }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.total_stake') }}</p>
              <p class="text-lg font-bold">{{ totalStats.totalStake }} TL</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.potential_payout') }}</p>
              <p class="text-lg font-bold">{{ totalStats.totalPayout }} TL</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted">{{ t('dashboard.profit_loss') }}</p>
              <p class="text-lg font-bold" :class="totalStats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'">{{ totalStats.profitLoss }} TL</p>
            </div>
          </div>
        </div>
      </template>
    </UAccordion>

    <!-- Coupon List Section -->
    <div class="space-y-4">
      <h2 class="text-md font-bold uppercase">{{ t('dashboard.coupon_list') }}</h2>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" size="sm" @click="refresh">
          {{ t('common.refresh') }}
        </UButton>
        <UButton variant="outline" color="blue" icon="i-lucide-clock" size="sm" @click="filterBy('ongoing')">
          {{ t('dashboard.ongoing_bets') }}
        </UButton>
        <UButton variant="outline" color="green" icon="i-lucide-trophy" size="sm" @click="filterBy('winning')">
          {{ t('dashboard.winning_bets') }}
        </UButton>
        <UButton variant="outline" color="red" icon="i-lucide-thumbs-down" size="sm" @click="filterBy('losing')">
          {{ t('dashboard.losing_bets') }}
        </UButton>
        <UButton variant="outline" color="orange" icon="i-lucide-rotate-ccw" size="sm" @click="filterBy('refunded')">
          {{ t('dashboard.refunded_bets') }}
        </UButton>
        <UButton variant="outline" color="neutral" icon="i-lucide-x-circle" size="sm" @click="filterBy('cancelled')">
          {{ t('dashboard.cancelled_bets') }}
        </UButton>
        <UButton variant="outline" color="neutral" icon="i-lucide-list" size="sm" @click="filterBy('all')">
          {{ t('common.all') }}
        </UButton>

        <USeparator orientation="vertical" class="h-6 mx-1" />

        <UButton variant="soft" color="red" icon="i-lucide-ban" size="sm">
          {{ t('common.cancel') }}
        </UButton>
        <UButton variant="soft" color="red" icon="i-lucide-trash" size="sm">
          {{ t('common.delete') }}
        </UButton>
        <UButton variant="soft" color="green" icon="i-lucide-check-circle" size="sm">
          {{ t('dashboard.mark_as_won') }}
        </UButton>
        <UButton variant="soft" color="red" icon="i-lucide-x-circle" size="sm">
          {{ t('dashboard.mark_as_lost') }}
        </UButton>
        <UButton variant="soft" color="primary" icon="i-lucide-eye" size="sm">
          {{ t('common.details') }}
        </UButton>
      </div>

      <!-- Search and Sort Row -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          :placeholder="t('dashboard.search_coupons')"
          class="w-full sm:w-80"
        />
        <div class="flex items-center gap-2">
          <AdminTableSortPopover :sorts="sorts" :sortable-columns="sortableColumns" :available-sort-columns="availableSortColumns"
            @add-sort="addSort" @remove-sort="removeSort" @update-sort-column="updateSortColumn" @update-sort-direction="updateSortDirection" @clear-sorts="clearSorts" />
          <AdminTableViewPopover :toggleable-columns="toggleableColumns" :visible-columns="visibleColumnKeys" @toggle-column="toggleColumn" />
        </div>
      </div>

      <!-- Table -->
      <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <UTable
          :data="paginatedCoupons"
          :columns="filteredColumns"
        >
          <template #process-cell="{ row }">
            <UCheckbox :model-value="selectedRows.includes(row.original.id)" @update:model-value="toggleRow(row.original.id)" />
          </template>
          <template #status-cell="{ row }">
            <UBadge
              :color="statusColor(row.original.status)"
              variant="subtle"
              size="sm"
            >
              {{ row.original.status }}
            </UBadge>
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
            <span>{{ t('common.rows_selected', { count: selectedRows.length, total: filteredCoupons.length }) }}</span>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

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

const searchQuery = ref('')
const selectedRows = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const activeFilter = ref<string>('all')
const filterStatus = ref<string>('')

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  sortBy: sortBy.value,
  sortDirection: sortDirection.value,
  ...(activeFilter.value !== 'all' ? { status: activeFilter.value.toUpperCase() } : {})
}))

const { data: couponsData, refresh: refreshCoupons } = await useAsyncData(
  'coupon-list',
  () => $fetch<{ data: any[], total: number }>('/api/coupons', { query: queryParams.value }),
  { watch: [queryParams] }
)

const { data: statsData } = await useAsyncData('coupon-stats', () =>
  $fetch<any>('/api/coupons/stats').catch(() => null)
)

const coupons = computed(() => (couponsData.value?.data ?? []).map(adaptCoupon))

const accordionItems = [
  { label: t('dashboard.coupon_list_filters'), value: 'filters' },
  { label: t('dashboard.single_bet_statistics'), value: 'single' },
  { label: t('dashboard.combined_bet_statistics'), value: 'combined' },
  { label: t('dashboard.total_bet_statistics'), value: 'total' }
]

const statusOptions = ['ongoing', 'winning', 'losing', 'won', 'lost', 'refunded', 'cancelled']

const columns = [
  { accessorKey: 'process', header: t('dashboard.process') },
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

const { sorts, sortBy, sortDirection, addSort, removeSort, updateSortColumn, updateSortDirection, clearSorts, availableSortColumns, visibleColumnKeys, toggleColumn, filteredColumns, sortableColumns, toggleableColumns } = useTableStore('coupon-list', columns, 'createdAt')

const singleStats = computed(() => {
  const s = statsData.value
  if (!s) {
    const singles = coupons.value.filter(c => c.type === 'single')
    return {
      total: singles.length,
      winning: singles.filter(c => c.status === 'winning' || c.status === 'won').length,
      losing: singles.filter(c => c.status === 'losing' || c.status === 'lost').length,
      totalStake: singles.reduce((sum, c) => sum + c.totalStake, 0)
    }
  }
  return { total: s.total ?? 0, winning: s.won ?? 0, losing: s.lost ?? 0, totalStake: parseFloat(s.totalStake ?? '0') }
})

const combinedStats = computed(() => {
  const combined = coupons.value.filter(c => c.type === 'combination')
  return {
    total: combined.length,
    winning: combined.filter(c => c.status === 'winning' || c.status === 'won').length,
    losing: combined.filter(c => c.status === 'losing' || c.status === 'lost').length,
    totalStake: combined.reduce((sum, c) => sum + c.totalStake, 0)
  }
})

const totalStats = computed(() => {
  const s = statsData.value
  if (s) {
    const stake = parseFloat(s.totalStake ?? '0')
    const payout = parseFloat(s.totalPayout ?? '0')
    return {
      total: s.total ?? 0,
      totalStake: stake,
      totalPayout: payout,
      profitLoss: stake - payout
    }
  }
  return {
    total: coupons.value.length,
    totalStake: coupons.value.reduce((sum, c) => sum + c.totalStake, 0),
    totalPayout: coupons.value.filter(c => c.status === 'won').reduce((sum, c) => sum + c.potentialPayout, 0),
    profitLoss: coupons.value.reduce((sum, c) => sum + c.totalStake, 0) - coupons.value.filter(c => c.status === 'won').reduce((sum, c) => sum + c.potentialPayout, 0)
  }
})

const filteredCoupons = computed(() => {
  let result = [...coupons.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.betSlipNo.toLowerCase().includes(query) ||
      c.player.toLowerCase().includes(query) ||
      c.agent.toLowerCase().includes(query) ||
      c.couponName.toLowerCase().includes(query)
    )
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil((couponsData.value?.total ?? 0) / pageSize.value)))

const paginatedCoupons = computed(() => filteredCoupons.value)

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    ongoing: 'blue',
    winning: 'green',
    losing: 'red',
    won: 'green',
    lost: 'red',
    refunded: 'orange',
    cancelled: 'neutral',
    deleted: 'neutral'
  }
  return colors[status] || 'neutral'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function toggleRow(id: string) {
  const index = selectedRows.value.indexOf(id)
  if (index === -1) {
    selectedRows.value.push(id)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

function filterBy(status: string) {
  activeFilter.value = status
  currentPage.value = 1
}

function refresh() {
  activeFilter.value = 'all'
  searchQuery.value = ''
  selectedRows.value = []
  refreshCoupons()
}
</script>
