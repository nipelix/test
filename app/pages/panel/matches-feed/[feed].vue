<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">
      {{ feed === 'live' ? t('matches.live_matches') : t('matches.prematch_matches') }}
    </h1>

    <UCard>
      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('matches.search')"
          :add-label="t('matches.add_match')"
          :selected-count="selectedRows.length"
          @refresh="handleRefresh"
          @activate="handleActivate"
          @deactivate="handleDeactivate"
          @update:search="searchQuery = $event"
        />

        <AdminUserTable
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
          @toggle-row="toggleRow"
          @toggle-all="toggleAll"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] })

const { t } = useI18n()
const toast = useToast()
const route = useRoute()

const feed = computed(() => {
  const f = route.params.feed as string
  return f === 'live' || f === 'line' ? f : 'live'
})

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'homeTeam', header: t('matches.home') },
  { accessorKey: 'awayTeam', header: t('matches.away') },
  { accessorKey: 'leagueName', header: t('common.league') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'startTime', header: t('matches.start_time') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, filteredColumns, bulkPatch
} = useEntityList<any>(`/api/matches?feed=${feed.value}`, `matches-${feed.value}`, columns)

async function handleActivate() {
  const { succeeded, failed } = await bulkPatch({ active: true })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}

async function handleDeactivate() {
  const { succeeded, failed } = await bulkPatch({ active: false })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}
</script>
