<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_leagues') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('leagues.search')"
          :add-label="t('leagues.add_league')"
          :selected-count="selectedRows.length"
          show-add
          show-delete
          @create="editItem = null; modalOpen = true"
          @edit="openEdit"
          @refresh="handleRefresh"
          @activate="handleBulkStatus(true)"
          @deactivate="handleBulkStatus(false)"
          @delete="handleBulkDelete"
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
      :title="editItem ? t('leagues.edit_league') : t('leagues.add_league')"
      :fields="formFields"
      :endpoint="'/api/leagues'"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })

const { t } = useI18n()
const toast = useToast()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'sportName', header: t('common.sport') },
  { accessorKey: 'countryName', header: t('countries.country') },
  { accessorKey: 'active', header: t('common.status') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, filteredColumns
} = useEntityList<any>('/api/leagues', 'manage-leagues', columns)

const modalOpen = ref(false)
const editItem = ref<any>(null)

const formFields = [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true }
]

function openEdit() {
  if (selectedRows.value.length === 1) {
    editItem.value = selectedRows.value[0]
    modalOpen.value = true
  }
}

async function handleBulkStatus(active: boolean) {
  if (selectedRows.value.length === 0) return
  const results = await Promise.allSettled(
    selectedRows.value.map(r => $fetch(`/api/leagues/${r.id}`, { method: 'PATCH', body: { active } }))
  )
  const failed = results.filter(r => r.status === 'rejected').length
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${results.length - failed}/${results.length}`, color: failed === 0 ? 'success' : 'warning' })
  handleRefresh()
}

async function handleBulkDelete() {
  if (selectedRows.value.length === 0) return
  const results = await Promise.allSettled(
    selectedRows.value.map(r => $fetch(`/api/leagues/${r.id}`, { method: 'DELETE' }))
  )
  const failed = results.filter(r => r.status === 'rejected').length
  toast.add({ title: failed === 0 ? t('modals.success_deleted') : `${results.length - failed}/${results.length}`, color: failed === 0 ? 'success' : 'warning' })
  handleRefresh()
}
</script>
