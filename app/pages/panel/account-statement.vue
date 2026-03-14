<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.account_statement') }}</h1>

    <UCard>
      <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
        <UFormField :label="t('common.start_date')" name="startDate">
          <UInput
            v-model="startDate"
            type="date"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('common.end_date')" name="endDate">
          <UInput
            v-model="endDate"
            type="date"
            class="w-full"
          />
        </UFormField>

        <UButton color="primary" icon="i-lucide-search" @click="handleFilter">
          {{ t('common.filter') }}
        </UButton>
      </div>

      <UTable
        :data="filteredTransactions"
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
const { transactions } = useMockData()

const startDate = ref('')
const endDate = ref('')

const columns = [
  { accessorKey: 'createdAt', header: t('common.date') },
  { accessorKey: 'type', header: t('common.type') },
  { accessorKey: 'amount', header: t('common.amount') },
  { accessorKey: 'balance', header: t('common.balance') },
  { accessorKey: 'description', header: t('common.description') }
]

const filteredTransactions = computed(() => {
  let result = [...transactions]
  if (startDate.value) {
    const start = new Date(startDate.value)
    result = result.filter(tx => new Date(tx.createdAt) >= start)
  }
  if (endDate.value) {
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59, 999)
    result = result.filter(tx => new Date(tx.createdAt) <= end)
  }
  return result
})

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

function handleFilter() {
  // Filter is reactive, no additional action needed
}
</script>
