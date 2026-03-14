<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_betting_groups') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('betting_groups.search')"
          :add-label="t('betting_groups.add_group')"
          :selected-count="selectedRows.length"
          show-add
          show-delete
          @create="editItem = null; modalOpen = true"
          @edit="openEdit"
          @refresh="handleRefresh"
          @activate="handleActivate"
          @deactivate="handleDeactivate"
          @delete="handleDelete"
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
      :title="editItem ? t('betting_groups.edit_group') : t('betting_groups.add_group')"
      :fields="formFields"
      endpoint="/api/betting-groups"
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
  { accessorKey: 'active', header: t('common.status') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, filteredColumns, bulkPatch, bulkDelete
} = useEntityList<any>('/api/betting-groups', 'manage-betting-groups', columns)

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

async function handleActivate() {
  const { succeeded, failed } = await bulkPatch({ active: true })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}

async function handleDeactivate() {
  const { succeeded, failed } = await bulkPatch({ active: false })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}

async function handleDelete() {
  const { succeeded, failed } = await bulkDelete()
  toast.add({ title: failed === 0 ? t('modals.success_deleted') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}
</script>
