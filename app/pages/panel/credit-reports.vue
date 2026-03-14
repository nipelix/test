<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.credit_report') }}</h1>

    <UTabs :items="reportTabs" class="w-full">
      <template #content="{ item }">
        <div class="mt-4 space-y-4">
          <!-- Date Range (only for custom) -->
          <div v-if="item.value === 'custom'" class="flex items-center gap-4">
            <UFormField :label="t('common.start_date')">
              <UInput v-model="customRange.start" type="date" />
            </UFormField>
            <UFormField :label="t('common.end_date')">
              <UInput v-model="customRange.end" type="date" />
            </UFormField>
            <UButton color="primary" class="mt-5" @click="loadReport(item.value)">{{ t('common.search') }}</UButton>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminStatCard icon="i-lucide-coins" :label="t('credit.total_credit_used')" :value="report.totalCreditUsed" icon-bg-class="bg-blue-100 dark:bg-blue-900/30" icon-class="text-blue-600" />
            <AdminStatCard icon="i-lucide-ticket" :label="t('credit.total_coupons')" :value="report.totalCoupons" icon-bg-class="bg-purple-100 dark:bg-purple-900/30" icon-class="text-purple-600" />
            <AdminStatCard icon="i-lucide-banknote" :label="t('credit.total_stake')" :value="`${report.totalStake} TL`" icon-bg-class="bg-green-100 dark:bg-green-900/30" icon-class="text-green-600" />
            <AdminStatCard icon="i-lucide-trending-up" :label="t('credit.avg_credit_per_coupon')" :value="report.avgCredit" icon-bg-class="bg-orange-100 dark:bg-orange-900/30" icon-class="text-orange-600" />
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] })

const { t } = useI18n()

const reportTabs = [
  { label: t('credit.custom'), value: 'custom' },
  { label: t('credit.weekly'), value: 'weekly' },
  { label: t('credit.monthly'), value: 'monthly' },
  { label: t('credit.yearly'), value: 'yearly' }
]

const customRange = reactive({ start: '', end: '' })
const report = reactive({ totalCreditUsed: 0, totalCoupons: 0, totalStake: '0', avgCredit: '0' })

async function loadReport(period: string) {
  try {
    const query: Record<string, any> = {}
    if (period === 'custom') {
      query.startDate = customRange.start
      query.endDate = customRange.end
    } else {
      query.period = period
    }
    const data = await $fetch<any>('/api/coupons/stats', { query })
    report.totalCreditUsed = data.totalCredit ?? 0
    report.totalCoupons = data.total ?? 0
    report.totalStake = data.totalStake ?? '0'
    report.avgCredit = data.total ? (data.totalCredit / data.total).toFixed(1) : '0'
  } catch {
    // silent
  }
}

loadReport('weekly')
</script>
