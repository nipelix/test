<template>
  <div class="space-y-6">
    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminStatCard
        icon="i-lucide-trophy"
        :label="t('dashboard.winning')"
        :value="stats.won"
        :loading="!statsData"
        icon-bg-class="bg-green-100 dark:bg-green-900/30"
        icon-class="text-green-600 dark:text-green-400"
      />
      <AdminStatCard
        icon="i-lucide-thumbs-down"
        :label="t('dashboard.losing')"
        :value="stats.lost"
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
        :value="stats.total"
        icon-bg-class="bg-purple-100 dark:bg-purple-900/30"
        icon-class="text-purple-600 dark:text-purple-400"
      />
      <AdminStatCard
        icon="i-lucide-banknote"
        :label="t('dashboard.won_payout')"
        :value="`${formatBalance(stats.totalPayout)} TL`"
        icon-bg-class="bg-green-100 dark:bg-green-900/30"
        icon-class="text-green-600 dark:text-green-400"
      />
      <AdminStatCard
        icon="i-lucide-trending-up"
        :label="t('dashboard.profit_loss')"
        :value="`${formatBalance(stats.profitLoss)} TL`"
        :icon-bg-class="stats.profitLoss >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'"
        :icon-class="stats.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
      />
    </div>

    <!-- Bottom Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Couponed Matches -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 text-primary" />
            <h3 class="text-sm font-semibold uppercase">{{ t('dashboard.most_couponed_matches') }}</h3>
          </div>
        </template>
        <div class="divide-y divide-gray-200 dark:divide-gray-800">
          <div
            v-for="(match, index) in topMatches"
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
            <UBadge color="primary" variant="subtle" size="sm">{{ match.couponCount }}</UBadge>
          </div>
          <p v-if="topMatches.length === 0" class="text-sm text-muted text-center py-4">{{ t('common.no_data') }}</p>
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
            v-for="(risk, index) in riskCoupons"
            :key="index"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4" :class="risk.level === 'high' ? 'text-red-500' : 'text-orange-500'" />
              <div>
                <p class="text-sm font-medium">{{ risk.betSlipNo }}</p>
                <p class="text-xs text-muted">{{ risk.playerUsername }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-red-600">{{ formatBalance(risk.potentialPayout) }} TL</p>
              <p class="text-xs text-muted">Odds: {{ Number(risk.totalOdds).toFixed(2) }}</p>
            </div>
          </div>
          <p v-if="riskCoupons.length === 0" class="text-sm text-muted text-center py-4">{{ t('common.no_data') }}</p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatBalance } from '~~/shared/utils/formatters'
import { isRole } from '~~/shared/types/roles'

definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const auth = useAuthStore()

// Fetch stats
const { data: statsData } = await useAsyncData('dashboard-stats', () =>
  $fetch<any>('/api/coupons/stats').catch(() => null)
)

// Role-based profit calculation:
// Dealer/Admin/Agent: profit = totalStake - wonPayout (players losing = dealer winning)
// Player/SubDealer: profit = wonPayout - totalStake (winning = profit)
const isDealerSide = computed(() => {
  const role = auth.user?.role
  return role && isRole(role) && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER'].includes(role)
})

const stats = computed(() => {
  const s = statsData.value
  if (!s) return { won: 0, lost: 0, ongoing: 0, total: 0, totalPayout: 0, profitLoss: 0 }
  const stake = parseFloat(s.totalStake ?? '0')
  const payout = parseFloat(s.totalPayout ?? '0')
  const profitLoss = isDealerSide.value ? (stake - payout) : (payout - stake)
  return {
    won: s.won ?? 0,
    lost: s.lost ?? 0,
    ongoing: s.ongoing ?? 0,
    total: s.total ?? 0,
    totalPayout: payout,
    profitLoss
  }
})

// Top couponed matches
const { data: couponsData } = await useAsyncData('dashboard-coupons', () =>
  $fetch<{ data: any[] }>('/api/coupons', { query: { limit: 100, status: 'ONGOING' } }).catch(() => ({ data: [] }))
)

const topMatches = computed(() => {
  const coupons = couponsData.value?.data ?? []
  const matchCounts = new Map<string, { homeTeam: string; awayTeam: string; leagueName: string; couponCount: number }>()

  for (const c of coupons) {
    const key = `${c.homeTeam ?? ''}-${c.awayTeam ?? ''}`
    if (!key || key === '-') continue
    const existing = matchCounts.get(key)
    if (existing) existing.couponCount++
    else matchCounts.set(key, { homeTeam: c.homeTeam ?? '', awayTeam: c.awayTeam ?? '', leagueName: c.leagueName ?? '', couponCount: 1 })
  }

  return Array.from(matchCounts.values()).sort((a, b) => b.couponCount - a.couponCount).slice(0, 10)
})

// Risk analysis
const riskCoupons = computed(() => {
  const coupons = couponsData.value?.data ?? []
  return coupons
    .filter((c: any) => c.status === 'ONGOING' || c.status === 'WINNING')
    .sort((a: any, b: any) => parseFloat(b.potentialPayout ?? '0') - parseFloat(a.potentialPayout ?? '0'))
    .slice(0, 10)
    .map((c: any) => ({
      betSlipNo: c.betSlipNo,
      playerUsername: c.playerUsername ?? `Player #${c.playerId}`,
      potentialPayout: c.potentialPayout,
      totalOdds: c.totalOdds,
      level: parseFloat(c.potentialPayout ?? '0') > 10000 ? 'high' : 'medium'
    }))
})
</script>
