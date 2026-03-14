<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.agent_list') }}</h1>
      </template>

      <div class="space-y-4">
        <!-- Toolbar -->
        <AdminUserToolbar
          v-model:search="searchQuery"
          :search-placeholder="t('agents.search_agents')"
          :add-label="t('agents.add_agent')"
          :selected-count="selectedRows.length"
          show-credit
          :sorts="sorts"
          :sortable-columns="sortableColumns"
          :available-sort-columns="availableSortColumns"
          :toggleable-columns="toggleableColumns"
          :visible-columns="visibleColumnKeys"
          @create="createModalOpen = true"
          @edit="editModalOpen = selectedRows.length === 1"
          @refresh="handleRefresh"
          @credit="creditModalOpen = true"
          @status="openConfirmAction"
          @add-sort="addSort"
          @remove-sort="removeSort"
          @update-sort-column="updateSortColumn"
          @update-sort-direction="updateSortDirection"
          @clear-sorts="clearSorts"
          @toggle-column="toggleColumn"
          @export="exportToCsv(rows, columns, 'agents')"
        />

        <!-- Table -->
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

    <!-- Modals -->
    <AdminUserCreateModal v-model:open="createModalOpen" role="AGENT" @success="handleModalSuccess" />
    <AdminUserEditModal v-model:open="editModalOpen" :user="editUser" @success="handleModalSuccess" />
    <AdminCreditModal v-model:open="creditModalOpen" :all-users="rows" :pre-selected-ids="selectedRows.map(r => r.id)" :label="t('dashboard.agent')" @success="handleModalSuccess" />
    <AdminConfirmActionModal v-model:open="confirmActionOpen" :action="confirmAction" :users="selectedRows" @success="handleModalSuccess" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] })

const { t } = useI18n()
const { exportToCsv } = useTableExport()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'username', header: t('dashboard.agent') },
  { accessorKey: 'balance', header: t('common.credit') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'createdAt', header: t('agents.membership_date') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, handleModalSuccess,
  sorts, sortableColumns, availableSortColumns, visibleColumnKeys,
  filteredColumns, toggleableColumns, addSort, removeSort,
  updateSortColumn, updateSortDirection, clearSorts, toggleColumn
} = useUserList('AGENT', 'agents', columns)

const editUser = computed(() => selectedRows.value.length === 1 ? selectedRows.value[0] : null)

// Modal states
const createModalOpen = ref(false)
const editModalOpen = ref(false)
const creditModalOpen = ref(false)
const confirmActionOpen = ref(false)
const confirmAction = ref<'activate' | 'deactivate' | 'delete'>('activate')

function openConfirmAction(action: 'activate' | 'deactivate' | 'delete') {
  confirmAction.value = action
  confirmActionOpen.value = true
}
</script>
