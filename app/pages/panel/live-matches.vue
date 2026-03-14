<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold">{{ t('dashboard.live_match') }}</h1>
      <UButton icon="i-lucide-refresh-cw" variant="outline" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <UTabs :items="tabs" class="w-full">
      <template #content="{ item }">
        <div class="mt-4">
          <AdminUserTable
            :data="item.value === 'live' ? liveRows : upcomingRows"
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
            @toggle-row="toggleRow"
            @toggle-all="toggleAll"
            @update:current-page="currentPage = $event"
            @update:page-size="pageSize = $event"
          />
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()

const tabs = [
  { label: t('matches.live_matches'), value: 'live' },
  { label: t('matches.upcoming'), value: 'upcoming' }
]

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'homeTeam', header: t('matches.home') },
  { accessorKey: 'awayTeam', header: t('matches.away') },
  { accessorKey: 'leagueName', header: t('common.league') },
  { accessorKey: 'score', header: t('matches.score') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'startTime', header: t('matches.start_time') }
]

const {
  rows, total, totalPages, status, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected,
  toggleAll, toggleRow, handleRefresh, filteredColumns
} = useEntityList<any>('/api/matches', 'live-matches', columns)

const liveRows = computed(() => rows.value.filter((r: any) => r.status === 'LIVE'))
const upcomingRows = computed(() => rows.value.filter((r: any) => r.status === 'SCHEDULED' || r.status === 'PREMATCH'))
</script>
