<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.matches') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('matches.search')"
          :add-label="t('matches.add_match')"
          :selected-count="selectedRows.length"
          show-add
          @create="editItem = null; modalOpen = true"
          @edit="openEdit"
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

    <AdminEntityFormModal
      v-model:open="modalOpen"
      :item="editItem"
      :title="editItem ? t('matches.edit') : t('matches.add_match')"
      :fields="formFields"
      endpoint="/api/matches"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const toast = useToast()

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
} = useEntityList<any>('/api/matches', 'matches-list', columns)

const modalOpen = ref(false)
const editItem = ref<any>(null)

const formFields = [
  { key: 'homeTeam', label: t('matches.home'), type: 'text' as const, required: true },
  { key: 'awayTeam', label: t('matches.away'), type: 'text' as const, required: true }
]

function openEdit() {
  if (selectedRows.value.length === 1) {
    editItem.value = selectedRows.value[0]
    modalOpen.value = true
  }
}

async function handleActivate() {
  const { succeeded, failed } = await bulkPatch({ status: 'LIVE' })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}

async function handleDeactivate() {
  const { succeeded, failed } = await bulkPatch({ status: 'CANCELLED' })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}
</script>
