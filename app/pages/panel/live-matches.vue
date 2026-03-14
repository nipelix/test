<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('dashboard.live_match') }}</h1>
      <UButton
        icon="i-lucide-refresh-cw"
        color="primary"
        variant="outline"
        @click="handleRefresh"
      >
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <UCard>
      <UTable
        :data="liveMatches"
        :columns="columns"
      >
        <template #score-cell="{ row }">
          <span v-if="row.original.score" class="font-bold">
            {{ row.original.score.home }} - {{ row.original.score.away }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #minute-cell="{ row }">
          <span v-if="row.original.minute" class="text-orange-500 font-semibold">
            {{ row.original.minute }}'
          </span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'live' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ row.original.status }}
          </UBadge>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()

const { data: liveData, refresh } = await useAsyncData('live-matches', () =>
  $fetch<{ data: any[], total: number }>('/api/matches', { query: { status: 'LIVE', limit: 100 } })
)

const liveMatches = computed(() => (liveData.value?.data ?? []).map(m => ({
  ...m,
  status: m.status ? m.status.toLowerCase() : '',
  score: m.scoreHome != null ? { home: m.scoreHome, away: m.scoreAway } : null
})))

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'homeTeam', header: t('common.home_team') },
  { accessorKey: 'awayTeam', header: t('common.away_team') },
  { accessorKey: 'leagueName', header: t('common.league') },
  { accessorKey: 'score', header: t('common.score') },
  { accessorKey: 'minute', header: t('common.minute') },
  { accessorKey: 'status', header: t('common.status') }
]

function handleRefresh() {
  refresh()
}
</script>
