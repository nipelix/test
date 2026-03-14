<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-clock" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.active_coupons') }}</h1>
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
      <UTable
        :data="sortedCoupons"
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
      <div class="flex items-center justify-between text-sm text-muted px-2">
        <span>{{ t('common.rows_selected', { count: selectedRows.length, total: sortedCoupons.length }) }}</span>
        <span>{{ t('common.page_of', { page: currentPage, pages: totalPages }) }}</span>
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

const searchQuery = ref('')
const selectedRows = ref<number[]>([])
const currentPage = ref(1)
const activeFilter = ref<string>('all')
const filterStatus = ref<string>('')

const { data: activeCouponsData, refresh: refreshCoupons } = await useAsyncData('active-coupons', () =>
  $fetch<{ data: any[] }>('/api/coupons/active')
)

const activeCoupons = computed(() => (activeCouponsData.value?.data ?? []).map(adaptCoupon))

const accordionItems = [
  { label: t('dashboard.coupon_list_filters'), value: 'filters' },
  { label: t('dashboard.single_bet_statistics'), value: 'single' },
  { label: t('dashboard.combined_bet_statistics'), value: 'combined' },
  { label: t('dashboard.total_bet_statistics'), value: 'total' }
]

const statusOptions = ['ongoing', 'winning', 'losing']

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

const { sorts, sortBy, sortDirection, addSort, removeSort, updateSortColumn, updateSortDirection, clearSorts, availableSortColumns, visibleColumnKeys, toggleColumn, filteredColumns, sortableColumns, toggleableColumns } = useTableStore('active-coupons', columns, 'createdAt')

const singleStats = computed(() => {
  const singles = activeCoupons.value.filter(c => c.type === 'single')
  return {
    total: singles.length,
    winning: singles.filter(c => c.status === 'winning').length,
    losing: singles.filter(c => c.status === 'losing').length,
    totalStake: singles.reduce((sum, c) => sum + c.totalStake, 0)
  }
})

const combinedStats = computed(() => {
  const combined = activeCoupons.value.filter(c => c.type === 'combination')
  return {
    total: combined.length,
    winning: combined.filter(c => c.status === 'winning').length,
    losing: combined.filter(c => c.status === 'losing').length,
    totalStake: combined.reduce((sum, c) => sum + c.totalStake, 0)
  }
})

const totalStats = computed(() => {
  return {
    total: activeCoupons.value.length,
    totalStake: activeCoupons.value.reduce((sum, c) => sum + c.totalStake, 0),
    totalPayout: activeCoupons.value.reduce((sum, c) => sum + c.potentialPayout, 0),
    profitLoss: activeCoupons.value.reduce((sum, c) => sum + c.totalStake, 0) - activeCoupons.value.reduce((sum, c) => sum + c.potentialPayout, 0)
  }
})

const filteredCoupons = computed(() => {
  let result = [...activeCoupons.value]

  if (activeFilter.value !== 'all') {
    result = result.filter(c => c.status === activeFilter.value)
  }

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

const sortedCoupons = computed(() => {
  const data = [...filteredCoupons.value]
  if (sorts.value.length === 0) return data
  return data.sort((a, b) => {
    for (const s of sorts.value) {
      const key = s.key as keyof typeof a
      const dir = s.direction === 'asc' ? 1 : -1
      const va = a[key] ?? ''
      const vb = b[key] ?? ''
      let cmp = 0
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb
      else cmp = String(va).localeCompare(String(vb))
      if (cmp !== 0) return cmp * dir
    }
    return 0
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCoupons.value.length / 10)))

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    ongoing: 'blue',
    winning: 'green',
    losing: 'red'
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

function toggleRow(id: number) {
  const index = selectedRows.value.indexOf(id)
  if (index === -1) {
    selectedRows.value.push(id)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

function filterBy(status: string) {
  activeFilter.value = status
}

function refresh() {
  activeFilter.value = 'all'
  searchQuery.value = ''
  selectedRows.value = []
  refreshCoupons()
}
</script>
