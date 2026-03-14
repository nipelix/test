<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.transaction_history') }}</h1>

    <UCard>
      <UTable
        :data="transactions"
        :columns="columns"
      >
        <template #type-cell="{ row }">
          <UBadge
            :color="getTypeColor(row.original.type)"
            variant="subtle"
          >
            {{ row.original.type }}
          </UBadge>
        </template>

        <template #amount-cell="{ row }">
          <span :class="row.original.amount >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ row.original.amount >= 0 ? '+' : '' }}{{ row.original.amount.toLocaleString('tr-TR') }} TL
          </span>
        </template>

        <template #balance-cell="{ row }">
          {{ row.original.balance.toLocaleString('tr-TR') }} TL
        </template>

        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()

const { data: txData } = await useAsyncData('transaction-history', () =>
  $fetch<{ data: any[], total: number }>('/api/transactions', { query: { limit: 50 } })
)

const transactions = computed(() => (txData.value?.data ?? []).map(tx => ({
  ...tx,
  type: tx.type ? tx.type.toLowerCase() : '',
  amount: tx.amount ?? 0,
  balance: tx.balance ?? 0,
  user: tx.user ?? ''
})))

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'type', header: t('common.type') },
  { accessorKey: 'amount', header: t('common.amount') },
  { accessorKey: 'balance', header: t('common.balance') },
  { accessorKey: 'description', header: t('common.description') },
  { accessorKey: 'user', header: t('common.user') },
  { accessorKey: 'createdAt', header: t('common.date') }
]

function getTypeColor(type: string) {
  switch (type) {
    case 'deposit': return 'success' as const
    case 'withdrawal': return 'error' as const
    case 'bet': return 'warning' as const
    case 'payout': return 'success' as const
    case 'refund': return 'info' as const
    case 'credit_add': return 'success' as const
    case 'credit_remove': return 'error' as const
    default: return 'neutral' as const
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
