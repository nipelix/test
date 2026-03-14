<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.transaction_history') }}</h1>

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
      :status-color="typeColor"
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
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'type', header: t('common.type') },
  { accessorKey: 'amount', header: t('common.amount') },
  { accessorKey: 'balanceBefore', header: t('transactions.balance_before') },
  { accessorKey: 'balanceAfter', header: t('transactions.balance_after') },
  { accessorKey: 'description', header: t('common.description') },
  { accessorKey: 'createdAt', header: t('common.time') }
]

const {
  rows, total, totalPages, status, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected,
  toggleAll, toggleRow, filteredColumns
} = useEntityList<any>('/api/transactions', 'transaction-history', columns, 'createdAt')

function typeColor(type: string): string {
  const colors: Record<string, string> = {
    DEPOSIT: 'success', WITHDRAWAL: 'error', BET: 'info',
    WIN: 'success', CANCEL: 'warning', REFUND: 'warning',
    CREDIT_DEDUCTION: 'error', CREDIT_RETURN: 'success'
  }
  return colors[type] || 'neutral'
}
</script>
