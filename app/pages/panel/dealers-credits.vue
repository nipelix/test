<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dealers.dealers_credits') }}</h1>

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
            <UButton color="success" icon="i-lucide-plus" @click="handleAddCredit">
              {{ t('dealers.add_credit') }}
            </UButton>
            <UButton color="error" icon="i-lucide-minus" @click="handleRemoveCredit">
              {{ t('dealers.remove_credit') }}
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="text-sm font-semibold uppercase">{{ t('dealers.recent_credit_transactions') }}</h3>
      </template>
      <UTable
        :data="creditTransactions"
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
definePageMeta({ layout: 'panel', middleware: 'panel' })

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

const creditTransactions = computed(() => {
  return transactions.filter(tx => tx.type === 'credit_add' || tx.type === 'credit_remove')
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

function handleAddCredit() {
  // Add credit logic
}

function handleRemoveCredit() {
  // Remove credit logic
}
</script>
