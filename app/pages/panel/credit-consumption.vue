<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.credit_consumption') }}</h1>

    <UCard>
      <UTable
        :data="creditConsumptionRecords"
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
definePageMeta({ layout: 'panel' })

const { t } = useI18n()
const { transactions } = useMockData()

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'type', header: t('common.type') },
  { accessorKey: 'amount', header: t('common.amount') },
  { accessorKey: 'balance', header: t('common.balance') },
  { accessorKey: 'description', header: t('common.description') },
  { accessorKey: 'user', header: t('common.user') },
  { accessorKey: 'createdAt', header: t('common.date') }
]

const creditConsumptionRecords = computed(() => {
  return transactions.filter(tx =>
    tx.type === 'credit_add'
    || tx.type === 'credit_remove'
    || tx.type === 'bet'
    || tx.type === 'payout'
  )
})

function getTypeColor(type: string) {
  switch (type) {
    case 'credit_add': return 'success' as const
    case 'credit_remove': return 'error' as const
    case 'bet': return 'warning' as const
    case 'payout': return 'success' as const
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
