<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_sports') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('sports.search')"
          :add-label="t('sports.add_sport')"
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

    <!-- Edit/Create Modal -->
    <AdminEntityFormModal
      v-model:open="modalOpen"
      :item="editItem"
      :title="editItem ? t('sports.edit_sport') : t('sports.add_sport')"
      :fields="formFields"
      :endpoint="'/api/sports'"
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
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'active', header: t('common.status') },
  { accessorKey: 'createdAt', header: t('common.created_at') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, filteredColumns, bulkPatch, bulkDelete
} = useEntityList<any>('/api/sports', 'manage-sports', columns)

const modalOpen = ref(false)
const editItem = ref<any>(null)

const formFields = [
  { key: 'name', label: t('common.name'), type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text', required: true }
]

function openEdit() {
  if (selectedRows.value.length === 1) {
    editItem.value = selectedRows.value[0]
    modalOpen.value = true
  }
}

async function handleBulkStatus(active: boolean) {
  const { succeeded, failed } = await bulkPatch({ active })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}

async function handleBulkDelete() {
  const { succeeded, failed } = await bulkDelete()
  toast.add({ title: failed === 0 ? t('modals.success_deleted') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}
</script>
