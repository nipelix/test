<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dealers.dealers_balance') }}</h1>

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

    <AdminBalanceModal
      v-model:open="balanceModalOpen"
      :user-id="balanceUserId"
      :username="balanceUsername"
      :mode="balanceMode"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'username', header: t('dashboard.sub_dealer') },
  { accessorKey: 'balance', header: t('common.balance') },
  { accessorKey: 'status', header: t('common.status') }
]

const {
  rows, total, totalPages, status, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected,
  toggleAll, toggleRow, handleRefresh, filteredColumns
} = useUserList('SUB_DEALER', 'dealers-balance', columns)

const balanceModalOpen = ref(false)
const balanceMode = ref<'deposit' | 'withdraw'>('deposit')
const balanceUserId = ref<number | null>(null)
const balanceUsername = ref('')
</script>
