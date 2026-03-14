<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.credit_report') }}</h1>

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
        :data="filteredCreditTransactions"
        :columns="columns"
      >
        <template #type-cell="{ row }">
          <UBadge
            :color="row.original.type === 'credit_add' ? 'success' : 'error'"
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
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] })

const { t } = useI18n()
const { transactions } = useMockData()

const startDate = ref('')
const endDate = ref('')

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'type', header: t('common.type') },
  { accessorKey: 'amount', header: t('common.amount') },
  { accessorKey: 'balance', header: t('common.balance') },
  { accessorKey: 'description', header: t('common.description') },
  { accessorKey: 'user', header: t('common.user') },
  { accessorKey: 'createdAt', header: t('common.date') }
]

const filteredCreditTransactions = computed(() => {
  let result = transactions.filter(tx => tx.type === 'credit_add' || tx.type === 'credit_remove')
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
