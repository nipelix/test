<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.sub_dealer_list') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminUserToolbar
          v-model:search="searchQuery"
          :search-placeholder="t('dealers.search_sub_dealers')"
          :add-label="t('dealers.add_sub_dealer')"
          :selected-count="selectedRows.length"
          show-balance
          :sorts="sorts"
          :sortable-columns="sortableColumns"
          :available-sort-columns="availableSortColumns"
          :toggleable-columns="toggleableColumns"
          :visible-columns="visibleColumnKeys"
          @create="createModalOpen = true"
          @edit="editModalOpen = selectedRows.length === 1"
          @refresh="handleRefresh"
          @balance="openBalanceModal"
          @status="openConfirmAction"
          @add-sort="addSort"
          @remove-sort="removeSort"
          @update-sort-column="updateSortColumn"
          @update-sort-direction="updateSortDirection"
          @clear-sorts="clearSorts"
          @toggle-column="toggleColumn"
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

    <AdminUserCreateModal v-model:open="createModalOpen" role="SUB_DEALER" @success="handleModalSuccess" />
    <AdminUserEditModal v-model:open="editModalOpen" :user="editUser" @success="handleModalSuccess" />
    <AdminBalanceModal v-model:open="balanceModalOpen" :user-id="balanceUserId" :username="balanceUsername" :mode="balanceMode" @success="handleModalSuccess" />
    <AdminConfirmActionModal v-model:open="confirmActionOpen" :action="confirmAction" :users="selectedRows" @success="handleModalSuccess" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] })

const { t } = useI18n()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'username', header: t('dashboard.sub_dealer') },
  { accessorKey: 'balance', header: t('common.balance') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'createdAt', header: t('common.created_at') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, handleModalSuccess,
  sorts, sortableColumns, availableSortColumns, visibleColumnKeys,
  filteredColumns, toggleableColumns, addSort, removeSort,
  updateSortColumn, updateSortDirection, clearSorts, toggleColumn
} = useUserList('SUB_DEALER', 'sub-dealers', columns)

const editUser = computed(() => selectedRows.value.length === 1 ? selectedRows.value[0] : null)

const createModalOpen = ref(false)
const editModalOpen = ref(false)
const balanceModalOpen = ref(false)
const balanceMode = ref<'deposit' | 'withdraw'>('deposit')
const balanceUserId = ref<number | null>(null)
const balanceUsername = ref('')
const confirmActionOpen = ref(false)
const confirmAction = ref<'activate' | 'deactivate' | 'delete'>('activate')

function openBalanceModal(mode: 'deposit' | 'withdraw') {
  if (selectedRows.value.length !== 1) return
  const user = selectedRows.value[0]
  balanceUserId.value = user.id
  balanceUsername.value = user.username
  balanceMode.value = mode
  balanceModalOpen.value = true
}

function openConfirmAction(action: 'activate' | 'deactivate' | 'delete') {
  confirmAction.value = action
  confirmActionOpen.value = true
}
</script>
