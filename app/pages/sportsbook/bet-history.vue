<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-4">{{ $t('sportsbook.bet_history') }}</h2>

    <!-- Tabs: Open / Settled / Report -->
    <div class="flex items-center gap-4 mb-4 border-b border-gray-200 dark:border-gray-800">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="pb-3 text-sm font-medium border-b-2 transition"
        :class="activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Coupon Cards -->
    <div class="space-y-3">
      <div
        v-for="coupon in filteredCoupons"
        :key="coupon.id"
        class="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">{{ coupon.betSlipNo }}</span>
          <UBadge :color="getStatusColor(coupon.status)" variant="subtle" size="xs">
            {{ coupon.status }}
          </UBadge>
        </div>
        <div class="grid grid-cols-3 gap-2 text-sm text-muted">
          <div>{{ $t('sportsbook.stake') }}: <strong class="text-foreground">{{ coupon.totalStake }} TL</strong></div>
          <div>{{ $t('sportsbook.total_odds') }}: <strong class="text-foreground">{{ coupon.totalOdds }}</strong></div>
          <div>{{ $t('sportsbook.potential_payout') }}: <strong class="text-foreground">{{ coupon.potentialPayout }} TL</strong></div>
        </div>
        <div class="mt-2 text-xs text-muted">
          {{ coupon.selections.length }} {{ $t('sportsbook.markets') }} &bull; {{ coupon.type }}
        </div>
      </div>

      <div v-if="!filteredCoupons.length" class="text-center py-8">
        <p class="text-muted text-sm">{{ $t('common.no_result') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'sportsbook' })

const { t } = useI18n()
const { coupons } = useMockData()

const activeTab = ref('open')

const tabs = [
  { key: 'open', label: t('sportsbook.open') },
  { key: 'settled', label: t('sportsbook.settled') },
  { key: 'report', label: t('sportsbook.report') }
]

const filteredCoupons = computed(() => {
  switch (activeTab.value) {
    case 'open': return coupons.filter(c => ['ongoing', 'winning', 'losing'].includes(c.status))
    case 'settled': return coupons.filter(c => ['won', 'lost', 'refunded', 'cancelled'].includes(c.status))
    default: return coupons
  }
})

function getStatusColor(status: string) {
  const map: Record<string, 'success' | 'error' | 'warning' | 'info' | 'neutral'> = {
    ongoing: 'info', winning: 'success', losing: 'error', won: 'success',
    lost: 'error', refunded: 'warning', cancelled: 'neutral'
  }
  return map[status] || 'neutral'
}
</script>
