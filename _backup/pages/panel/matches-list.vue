<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.matches') }}</h1>

    <UCard>
      <UTable
        :data="matches"
        :columns="columns"
      >
        <template #status-cell="{ row }">
          <UBadge
            :color="getStatusColor(row.original.status)"
            variant="subtle"
          >
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #startTime-cell="{ row }">
          {{ formatDate(row.original.startTime) }}
        </template>
      </UTable>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <span class="text-sm text-muted">
          {{ t('common.showing') }} {{ matches.length }} {{ t('common.of') }} {{ totalItems }} {{ t('common.entries') }}
        </span>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-chevron-left"
            variant="outline"
            color="neutral"
            size="sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
          />
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <UButton
            icon="i-lucide-chevron-right"
            variant="outline"
            color="neutral"
            size="sm"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()

const currentPage = ref(1)
const pageSize = ref(10)

const queryParams = computed(() => ({ page: currentPage.value, limit: pageSize.value }))

const { data: matchesData } = await useAsyncData(
  'matches-list',
  () => $fetch<{ data: any[], total: number }>('/api/matches', { query: queryParams.value }),
  { watch: [queryParams] }
)

const matches = computed(() => (matchesData.value?.data ?? []).map(m => ({
  ...m,
  status: m.status ? m.status.toLowerCase() : ''
})))

const totalItems = computed(() => matchesData.value?.total ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'homeTeam', header: t('common.home_team') },
  { accessorKey: 'awayTeam', header: t('common.away_team') },
  { accessorKey: 'leagueName', header: t('common.league') },
  { accessorKey: 'sportName', header: t('common.sport') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'startTime', header: t('common.start_time') }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'live': return 'success' as const
    case 'prematch': return 'info' as const
    case 'finished': return 'neutral' as const
    case 'cancelled': return 'error' as const
    case 'postponed': return 'warning' as const
    default: return 'neutral' as const
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
