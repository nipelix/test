import { getCouponStatusColor } from '~~/shared/utils/formatters'
import type { CouponRow } from '~~/shared/types/entities'

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

type CouponFilter = 'all' | 'PENDING' | 'ONGOING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED'

export function useCouponList(
  pageKey: string,
  columns: Array<{ accessorKey: string; header: string }>,
  defaultFilter: CouponFilter = 'all'
) {
  const activeFilter = ref<CouponFilter>(defaultFilter)

  // Compose on top of useEntityList
  const entityList = useEntityList<CouponRow>('/api/coupons', pageKey, columns, 'createdAt')

  // Stats
  const { data: stats, refresh: refreshStats } = useAsyncData(
    `${pageKey}-stats`,
    () => $fetch<CouponStatsResponse>('/api/coupons/stats').catch(() => null)
  )

  // Override refresh to also refresh stats
  const originalRefresh = entityList.refresh
  function refresh() {
    originalRefresh()
    refreshStats()
  }

  function handleRefresh() {
    entityList.clearSelection()
    refresh()
  }

  function filterBy(filter: CouponFilter) {
    activeFilter.value = filter
    entityList.currentPage.value = 1
    entityList.clearSelection()
  }

  const couponStats = computed(() => {
    const s = stats.value
    if (!s) return { total: 0, ongoing: 0, won: 0, lost: 0, cancelled: 0, refunded: 0, totalStake: 0, totalPayout: 0, profitLoss: 0 }
    const stake = parseFloat(s.totalStake)
    const payout = parseFloat(s.totalPayout)
    return {
      total: s.total, ongoing: s.ongoing, won: s.won, lost: s.lost,
      cancelled: s.cancelled, refunded: s.refunded,
      totalStake: stake, totalPayout: payout, profitLoss: stake - payout
    }
  })

  return {
    ...entityList,
    refresh,
    handleRefresh,
    activeFilter,
    filterBy,
    couponStats,
    statusColor: getCouponStatusColor
  }
}
