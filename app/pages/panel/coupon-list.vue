<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-list" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.bet_slip_list') }}</h1>
    </div>

    <!-- Stats -->
    <AdminCouponStatsAccordion :stats="couponStats" />

    <!-- Toolbar -->
    <AdminCouponToolbar
      :search="searchQuery"
      :active-filter="activeFilter"
      :selected-count="selectedRows.length"
      show-bulk-actions
      :sorts="sorts"
      :sortable-columns="sortableColumns"
      :available-sort-columns="availableSortColumns"
      :toggleable-columns="toggleableColumns"
      :visible-columns="visibleColumnKeys"
      @refresh="handleRefresh"
      @filter="filterBy"
      @cancel="handleCancel"
      @delete="handleDelete"
      @mark-won="handleMarkWon"
      @mark-lost="handleMarkLost"
      @update:search="searchQuery = $event"
      @add-sort="addSort"
      @remove-sort="removeSort"
      @update-sort-column="updateSortColumn"
      @update-sort-direction="updateSortDirection"
      @clear-sorts="clearSorts"
      @toggle-column="toggleColumn"
    />

    <!-- Table -->
    <AdminCouponTable
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
      :status-color="statusColor"
      @toggle-row="toggleRow"
      @toggle-all="toggleAll"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const toast = useToast()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'betSlipNo', header: t('dashboard.bet_slip_no') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'type', header: t('common.type') },
  { accessorKey: 'stake', header: t('dashboard.total_stake') },
  { accessorKey: 'potentialPayout', header: t('dashboard.potential_payout') },
  { accessorKey: 'totalOdds', header: t('dashboard.total_odds') },
  { accessorKey: 'creditDeduction', header: t('common.credit') },
  { accessorKey: 'hasLiveSelections', header: 'Live' },
  { accessorKey: 'couponName', header: t('dashboard.coupon_name') },
  { accessorKey: 'ipAddress', header: t('dashboard.user_ip') },
  { accessorKey: 'createdAt', header: t('common.time') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  activeFilter, selectedIds, selectedRows, allSelected, someSelected,
  toggleAll, toggleRow, filterBy, handleRefresh, couponStats, statusColor,
  sorts, sortableColumns, availableSortColumns, visibleColumnKeys,
  filteredColumns, toggleableColumns, addSort, removeSort,
  updateSortColumn, updateSortDirection, clearSorts, toggleColumn
} = useCouponList('coupon-list', columns)

type BulkAction =
  | { type: 'cancel' }
  | { type: 'delete' }
  | { type: 'status'; status: 'WON' | 'LOST' }

async function handleBulkAction(action: BulkAction) {
  if (selectedRows.value.length === 0) return
  const results = await Promise.allSettled(
    selectedRows.value.map(c => {
      switch (action.type) {
        case 'cancel': return $fetch(`/api/coupons/${c.id}/cancel`, { method: 'POST' })
        case 'delete': return $fetch(`/api/coupons/${c.id}`, { method: 'DELETE' })
        case 'status': return $fetch(`/api/coupons/${c.id}`, { method: 'PATCH', body: { status: action.status } })
      }
    })
  )
  const failed = results.filter(r => r.status === 'rejected').length
  if (failed === 0) {
    toast.add({ title: t('modals.success_updated'), color: 'success' })
  } else {
    toast.add({ title: `${results.length - failed}/${results.length} ${t('modals.success_updated')}`, color: 'warning' })
  }
  handleRefresh()
}

function handleCancel() { handleBulkAction({ type: 'cancel' }) }
function handleDelete() { handleBulkAction({ type: 'delete' }) }
function handleMarkWon() { handleBulkAction({ type: 'status', status: 'WON' }) }
function handleMarkLost() { handleBulkAction({ type: 'status', status: 'LOST' }) }
</script>
