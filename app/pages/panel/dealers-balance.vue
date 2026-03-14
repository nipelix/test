<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dealers.dealers_balance') }}</h1>

    <UCard>
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <UFormField :label="t('dealers.select_dealer')" name="dealer">
            <USelectMenu
              v-model="selectedDealer"
              :items="dealerOptions"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('common.amount')" name="amount">
            <UInput
              v-model="amount"
              type="number"
              :placeholder="t('common.amount')"
              class="w-full"
            />
          </UFormField>

          <div class="flex items-center gap-2">
            <UButton color="success" icon="i-lucide-plus" @click="handleAddBalance">
              {{ t('dealers.add_balance') }}
            </UButton>
            <UButton color="error" icon="i-lucide-minus" @click="handleRemoveBalance">
              {{ t('dealers.remove_balance') }}
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="text-sm font-semibold uppercase">{{ t('dealers.recent_balance_transactions') }}</h3>
      </template>
      <UTable
        :data="balanceTransactions"
        :columns="columns"
      >
        <template #type-cell="{ row }">
          <UBadge
            :color="row.original.type === 'deposit' ? 'success' : 'error'"
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
const { dealers, transactions } = useMockData()

const selectedDealer = ref('')
const amount = ref(0)

const dealerOptions = computed(() => {
  return dealers.map(d => ({
    label: d.username,
    value: d.username
  }))
})

const balanceTransactions = computed(() => {
  return transactions.filter(tx => tx.type === 'deposit' || tx.type === 'withdrawal')
})

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'type', header: t('common.type') },
  { accessorKey: 'amount', header: t('common.amount') },
  { accessorKey: 'balance', header: t('common.balance') },
  { accessorKey: 'description', header: t('common.description') },
  { accessorKey: 'user', header: t('common.user') },
  { accessorKey: 'createdAt', header: t('common.date') }
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleAddBalance() {
  // Add balance logic
}

function handleRemoveBalance() {
  // Remove balance logic
}
</script>
