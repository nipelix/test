<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-archive-restore" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.coupon_trash') }}</h1>
    </div>

    <AdminCouponToolbar
      :search="searchQuery"
      :active-filter="activeFilter"
      :selected-count="selectedRows.length"
      :sorts="sorts"
      :sortable-columns="sortableColumns"
      :available-sort-columns="availableSortColumns"
      :toggleable-columns="toggleableColumns"
      :visible-columns="visibleColumnKeys"
      @refresh="handleRefresh"
      @filter="filterBy"
      @update:search="searchQuery = $event"
      @add-sort="addSort"
      @remove-sort="removeSort"
      @update-sort-column="updateSortColumn"
      @update-sort-direction="updateSortDirection"
      @clear-sorts="clearSorts"
      @toggle-column="toggleColumn"
    />

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

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'betSlipNo', header: t('dashboard.bet_slip_no') },
  { accessorKey: 'status', header: t('common.status') },
  { accessorKey: 'stake', header: t('dashboard.total_stake') },
  { accessorKey: 'potentialPayout', header: t('dashboard.potential_payout') },
  { accessorKey: 'totalOdds', header: t('dashboard.total_odds') },
  { accessorKey: 'cancelledAt', header: t('dashboard.cancelled_at') },
  { accessorKey: 'createdAt', header: t('common.time') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  activeFilter, selectedIds, selectedRows, allSelected, someSelected,
  toggleAll, toggleRow, filterBy, handleRefresh, statusColor,
  sorts, sortableColumns, availableSortColumns, visibleColumnKeys,
  filteredColumns, toggleableColumns, addSort, removeSort,
  updateSortColumn, updateSortDirection, clearSorts, toggleColumn
} = useCouponList('coupon-trash', columns, 'CANCELLED')
</script>
