<template>
  <div class="space-y-6">
    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminStatCard
        icon="i-lucide-trophy"
        :label="t('dashboard.winning')"
        :value="stats.winning"
        icon-bg-class="bg-green-100 dark:bg-green-900/30"
        icon-class="text-green-600 dark:text-green-400"
      />
      <AdminStatCard
        icon="i-lucide-thumbs-down"
        :label="t('dashboard.losing')"
        :value="stats.losing"
        icon-bg-class="bg-red-100 dark:bg-red-900/30"
        icon-class="text-red-600 dark:text-red-400"
      />
      <AdminStatCard
        icon="i-lucide-clock"
        :label="t('dashboard.ongoing')"
        :value="stats.ongoing"
        icon-bg-class="bg-blue-100 dark:bg-blue-900/30"
        icon-class="text-blue-600 dark:text-blue-400"
      />
      <AdminStatCard
        icon="i-lucide-ticket"
        :label="t('dashboard.total_coupons')"
        :value="stats.totalCoupons"
        icon-bg-class="bg-purple-100 dark:bg-purple-900/30"
        icon-class="text-purple-600 dark:text-purple-400"
      />
      <AdminStatCard
        icon="i-lucide-banknote"
        :label="t('dashboard.won_payout')"
        :value="`${stats.wonPayout} TL`"
        icon-bg-class="bg-green-100 dark:bg-green-900/30"
        icon-class="text-green-600 dark:text-green-400"
      />
      <AdminStatCard
        icon="i-lucide-trending-up"
        :label="t('dashboard.profit_loss')"
        :value="`${stats.profitLoss} TL`"
        icon-bg-class="bg-orange-100 dark:bg-orange-900/30"
        icon-class="text-orange-600 dark:text-orange-400"
      />
    </div>

    <!-- Bottom Cards Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Most Couponed Matches -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 text-primary" />
            <h3 class="text-sm font-semibold uppercase">{{ t('dashboard.most_couponed_matches') }}</h3>
          </div>
        </template>
        <div class="divide-y divide-gray-200 dark:divide-gray-800">
          <div
            v-for="(match, index) in topCouponedMatches"
            :key="index"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-muted w-5">{{ index + 1 }}</span>
              <div>
                <p class="text-sm font-medium">{{ match.homeTeam }} vs {{ match.awayTeam }}</p>
                <p class="text-xs text-muted">{{ match.leagueName }}</p>
              </div>
            </div>
            <UBadge color="primary" variant="subtle" size="sm">
              {{ match.couponCount }} coupons
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Risk Analysis -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-orange-500" />
            <h3 class="text-sm font-semibold uppercase">{{ t('dashboard.risk_analysis') }}</h3>
          </div>
        </template>
        <div class="divide-y divide-gray-200 dark:divide-gray-800">
          <div
            v-for="(risk, index) in highRiskCoupons"
            :key="index"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4 text-red-500" />
              <div>
                <p class="text-sm font-medium">{{ risk.betSlipNo }}</p>
                <p class="text-xs text-muted">{{ risk.player }} - {{ risk.totalMatches }} matches</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-red-600">{{ risk.potentialPayout }} TL</p>
              <p class="text-xs text-muted">Odds: {{ risk.totalOdds }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const { coupons, matches } = useMockData()

const stats = reactive({
  winning: 3,
  losing: 4,
  ongoing: 5,
  totalCoupons: 15,
  wonPayout: 1036,
  profitLoss: -450
})

const topCouponedMatches = computed(() => {
  const matchCounts = new Map<number, { homeTeam: string; awayTeam: string; leagueName: string; couponCount: number }>()

  for (const coupon of coupons) {
    for (const sel of coupon.selections) {
      const existing = matchCounts.get(sel.matchId)
      if (existing) {
        existing.couponCount++
      } else {
        matchCounts.set(sel.matchId, {
          homeTeam: sel.homeTeam,
          awayTeam: sel.awayTeam,
          leagueName: sel.leagueName,
          couponCount: 1
        })
      }
    }
  }

  return Array.from(matchCounts.values())
    .sort((a, b) => b.couponCount - a.couponCount)
    .slice(0, 5)
})

const highRiskCoupons = computed(() => {
  return [...coupons]
    .filter(c => c.status === 'ongoing' || c.status === 'winning')
    .sort((a, b) => b.potentialPayout - a.potentialPayout)
    .slice(0, 5)
})
</script>
