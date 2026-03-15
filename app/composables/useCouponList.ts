import { getCouponStatusColor } from '~~/shared/utils/formatters'
import type { CouponRow } from '~~/shared/types/entities'

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

// Only valid API status values
type CouponFilter = 'all' | 'PENDING' | 'ONGOING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED'

export function useCouponList(
  pageKey: string,
  columns: Array<{ accessorKey: string; header: string }>,
  defaultFilter: CouponFilter = 'all'
) {
  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 300)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const activeFilter = ref<CouponFilter>(defaultFilter)
  const selectedIds = reactive(new Set<number>())

  watch(debouncedSearch, () => { currentPage.value = 1 })

  const tableStore = useTableStore(pageKey, columns, 'createdAt')

  const queryParams = computed(() => ({
    page: currentPage.value,
    limit: pageSize.value,
    sortBy: tableStore.sortBy.value,
    sortDirection: tableStore.sortDirection.value,
    ...(activeFilter.value !== 'all' ? { status: activeFilter.value } : {}),
    ...(debouncedSearch.value.trim() ? { search: debouncedSearch.value.trim() } : {})
  }))

  const { data: response, refresh: refreshList, status } = useAsyncData(
    `${pageKey}-list`,
    () => $fetch<CouponListResponse>('/api/coupons', { query: queryParams.value }),
    { watch: [queryParams] }
  )

  const { data: stats, refresh: refreshStats } = useAsyncData(
    `${pageKey}-stats`,
    () => $fetch<CouponStatsResponse>('/api/coupons/stats').catch(() => null)
  )

  // Refresh both list and stats together
  function refresh() {
    refreshList()
    refreshStats()
  }

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

  // Stats (expose raw numbers for flexible formatting)
  const couponStats = computed(() => {
    const s = stats.value
    if (!s) return { total: 0, ongoing: 0, won: 0, lost: 0, cancelled: 0, refunded: 0, totalStake: 0, totalPayout: 0, profitLoss: 0 }
    const stake = parseFloat(s.totalStake)
    const payout = parseFloat(s.totalPayout)
    return {
      total: s.total,
      ongoing: s.ongoing,
      won: s.won,
      lost: s.lost,
      cancelled: s.cancelled,
      refunded: s.refunded,
      totalStake: stake,
      totalPayout: payout,
      profitLoss: stake - payout
    }
  })

  watch(pageSize, () => { currentPage.value = 1 })

  return {
    rows, total, totalPages, status, refresh,
    searchQuery, currentPage, pageSize, activeFilter,
    selectedIds, selectedRows, allSelected, someSelected,
    toggleAll, toggleRow, clearSelection, filterBy, handleRefresh,
    couponStats, statusColor: getCouponStatusColor,
    ...tableStore
  }
}
