<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_countries') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('countries.search')"
          :add-label="t('countries.add_country')"
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
      :title="editItem ? t('countries.edit_country') : t('countries.add_country')"
      :fields="formFields"
      :endpoint="'/api/countries'"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import type { Country } from '~~/shared/types/entities'
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })

const { t } = useI18n()
const toast = useToast()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'code', header: t('countries.code') },
  { accessorKey: 'flag', header: t('countries.flag') },
  { accessorKey: 'active', header: t('common.status') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, filteredColumns, bulkPatch, bulkDelete
} = useEntityList<Country>('/api/countries', 'manage-countries', columns)

const modalOpen = ref(false)
const editItem = ref<Country | null>(null)

const formFields = [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'code', label: t('countries.code'), type: 'text' as const, required: true },
  { key: 'flag', label: t('countries.flag'), type: 'text' as const }
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
