<template>
  <UAccordion :items="items" multiple>
    <template #body="{ item }">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <div v-for="stat in item.stats" :key="stat.label" class="text-center">
          <p class="text-xs text-muted">{{ stat.label }}</p>
          <p class="text-lg font-bold" :class="stat.colorClass">{{ stat.value }}</p>
        </div>
      </div>
    </template>
  </UAccordion>
</template>

<script setup lang="ts">
const props = defineProps<{
  stats: {
    total: number
    ongoing: number
    won: number
    lost: number
    cancelled: number
    refunded: number
    totalStake: string
    totalPayout: string
    profitLoss: string
  }
}>()

const { t } = useI18n()

const items = computed(() => [
  {
    label: t('dashboard.total_bet_statistics'),
    value: 'total',
    stats: [
      { label: t('common.total'), value: props.stats.total, colorClass: '' },
      { label: t('dashboard.ongoing'), value: props.stats.ongoing, colorClass: 'text-blue-600' },
      { label: t('dashboard.won'), value: props.stats.won, colorClass: 'text-green-600' },
      { label: t('dashboard.lost'), value: props.stats.lost, colorClass: 'text-red-600' },
      { label: t('dashboard.cancelled'), value: props.stats.cancelled, colorClass: 'text-gray-500' },
      { label: t('dashboard.refunded'), value: props.stats.refunded, colorClass: 'text-orange-500' },
      { label: t('dashboard.total_stake'), value: `${props.stats.totalStake} TL`, colorClass: '' },
      { label: t('dashboard.profit_loss'), value: `${props.stats.profitLoss} TL`, colorClass: parseFloat(props.stats.profitLoss) >= 0 ? 'text-green-600' : 'text-red-600' }
    ]
  }
])
</script>
