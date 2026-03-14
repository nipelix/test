<template>
  <div class="space-y-6">
    <h1 class="text-lg font-bold uppercase">{{ t('dashboard.account_statement') }}</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <AdminStatCard
        icon="i-lucide-ticket"
        :label="t('common.total')"
        :value="stats.total"
        icon-bg-class="bg-blue-100 dark:bg-blue-900/30"
        icon-class="text-blue-600 dark:text-blue-400"
      />
      <AdminStatCard
        icon="i-lucide-trophy"
        :label="t('dashboard.won')"
        :value="stats.won"
        icon-bg-class="bg-green-100 dark:bg-green-900/30"
        icon-class="text-green-600 dark:text-green-400"
      />
      <AdminStatCard
        icon="i-lucide-thumbs-down"
        :label="t('dashboard.lost')"
        :value="stats.lost"
        icon-bg-class="bg-red-100 dark:bg-red-900/30"
        icon-class="text-red-600 dark:text-red-400"
      />
      <AdminStatCard
        icon="i-lucide-banknote"
        :label="t('dashboard.profit_loss')"
        :value="`${profitLoss} TL`"
        :icon-bg-class="profitLossNum >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'"
        :icon-class="profitLossNum >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
      />
    </div>

    <!-- Coupon History Table -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ t('dashboard.coupon_history') }}</h2>
      </template>

      <AdminCouponTable
        :data="rows"
        :columns="filteredColumns"
        :loading="status === 'pending'"
        :selected-ids="selectedIds"
        :all-selected="allSelected"
        :some-selected="someSelected"
        :selected-count="selectedRows.length"
        :total="total"
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :status-color="statusColor"
        @toggle-row="toggleRow"
        @toggle-all="toggleAll"
        @update:current-page="currentPage = $event"
        @update:page-size="pageSize = $event"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { formatBalance } from '~~/shared/utils/formatters'

definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'betSlipNo', header: t('dashboard.bet_slip_no') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'type', header: t('common.type') },
  { accessorKey: 'stake', header: t('dashboard.total_stake') },
  { accessorKey: 'potentialPayout', header: t('dashboard.potential_payout') },
  { accessorKey: 'totalOdds', header: t('dashboard.total_odds') },
  { accessorKey: 'createdAt', header: t('common.time') }
]

const {
  rows, total, totalPages, status, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected,
  toggleAll, toggleRow, couponStats, statusColor,
  filteredColumns
} = useCouponList('account-statement', columns)

const stats = computed(() => couponStats.value)
const profitLossNum = computed(() => parseFloat(stats.value.profitLoss || '0'))
const profitLoss = computed(() => formatBalance(profitLossNum.value))
</script>
