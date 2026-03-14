import { formatBalance } from '~~/shared/utils/formatters'

export interface CouponRow {
  id: number
  betSlipNo: string
  playerId: number
  dealerId: number
  type: string
  status: string
  stake: string
  totalOdds: string
  potentialPayout: string
  actualPayout: string
  creditDeduction: string
  couponName: string | null
  hasLiveSelections: boolean
  ipAddress: string | null
  createdAt: string
  cancelledAt: string | null
  cancelledBy: number | null
  // Joined fields
  playerUsername?: string
  dealerUsername?: string
}

interface CouponListResponse {
  data: CouponRow[]
  total: number
  page: number
  limit: number
}

interface CouponStatsResponse {
  total: number
  ongoing: number
  won: number
  lost: number
  cancelled: number
  refunded: number
  totalStake: string
  totalPayout: string
}

type CouponFilter = 'all' | 'ONGOING' | 'WINNING' | 'LOSING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED'

export function useCouponList(
  pageKey: string,
  columns: Array<{ accessorKey: string; header: string }>,
  defaultFilter: CouponFilter = 'all'
) {
  const searchQuery = ref('')
  const debouncedSearch = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const activeFilter = ref<CouponFilter>(defaultFilter)
  const selectedIds = reactive(new Set<number>())

  // Debounce search
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(searchQuery, (val) => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      debouncedSearch.value = val
      currentPage.value = 1
    }, 300)
  })

  onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer)
  })

  const tableStore = useTableStore(pageKey, columns, 'createdAt')

  const queryParams = computed(() => ({
    page: currentPage.value,
    limit: pageSize.value,
    sortBy: tableStore.sortBy.value,
    sortDirection: tableStore.sortDirection.value,
    ...(activeFilter.value !== 'all' ? { status: activeFilter.value } : {}),
    ...(debouncedSearch.value.trim() ? { search: debouncedSearch.value.trim() } : {})
  }))

  const { data: response, refresh, status } = useAsyncData(
    `${pageKey}-list`,
    () => $fetch<CouponListResponse>('/api/coupons', { query: queryParams.value }),
    { watch: [queryParams] }
  )

  const { data: stats } = useAsyncData(
    `${pageKey}-stats`,
    () => $fetch<CouponStatsResponse>('/api/coupons/stats').catch(() => null)
  )

  const rows = computed(() => response.value?.data ?? [])
  const total = computed(() => response.value?.total ?? 0)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  // Selection
  const selectedRows = computed(() => rows.value.filter(r => selectedIds.has(r.id)))
  const allSelected = computed(() => rows.value.length > 0 && rows.value.every(r => selectedIds.has(r.id)))
  const someSelected = computed(() => !allSelected.value && rows.value.some(r => selectedIds.has(r.id)))

  function toggleAll() {
    if (allSelected.value) rows.value.forEach(r => selectedIds.delete(r.id))
    else rows.value.forEach(r => selectedIds.add(r.id))
  }

  function toggleRow(id: number) {
    selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id)
  }

  function clearSelection() { selectedIds.clear() }

  function filterBy(filter: CouponFilter) {
    activeFilter.value = filter
    currentPage.value = 1
    clearSelection()
  }

  function handleRefresh() {
    clearSelection()
    refresh()
  }

  // Stats helpers
  const couponStats = computed(() => {
    const s = stats.value
    if (!s) return { total: 0, ongoing: 0, won: 0, lost: 0, cancelled: 0, refunded: 0, totalStake: '0', totalPayout: '0', profitLoss: '0' }
    const stake = parseFloat(s.totalStake)
    const payout = parseFloat(s.totalPayout)
    return { ...s, profitLoss: formatBalance(stake - payout) }
  })

  // Status color helper
  function statusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'info', ONGOING: 'info', WINNING: 'success', LOSING: 'error',
      WON: 'success', LOST: 'error', CANCELLED: 'neutral', REFUNDED: 'warning'
    }
    return colors[status] || 'neutral'
  }

  watch(pageSize, () => { currentPage.value = 1 })

  return {
    rows, total, totalPages, status, refresh,
    searchQuery, currentPage, pageSize, activeFilter,
    selectedIds, selectedRows, allSelected, someSelected,
    toggleAll, toggleRow, clearSelection, filterBy, handleRefresh,
    couponStats, statusColor,
    ...tableStore
  }
}
