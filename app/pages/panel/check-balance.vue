<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('balance.check_balance') }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-wallet" class="w-5 h-5 text-primary" />
            <h3 class="text-sm font-semibold uppercase">{{ t('common.balance') }}</h3>
          </div>
        </template>
        <div class="text-center">
          <p class="text-3xl font-bold text-primary">
            {{ currentUser.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} TL
          </p>
          <p class="text-sm text-muted mt-1">{{ t('balance.current_balance') }}</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-green-500" />
            <h3 class="text-sm font-semibold uppercase">{{ t('common.credit') }}</h3>
          </div>
        </template>
        <div class="text-center">
          <p class="text-3xl font-bold text-green-600">
            {{ currentUser.balance_type }}
          </p>
          <p class="text-sm text-muted mt-1">{{ t('balance.balance_type') }}</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="w-5 h-5 text-orange-500" />
            <h3 class="text-sm font-semibold uppercase">{{ t('balance.last_transaction') }}</h3>
          </div>
        </template>
        <div class="text-center">
          <p class="text-lg font-bold">
            <span :class="lastTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ lastTransaction.amount >= 0 ? '+' : '' }}{{ lastTransaction.amount.toLocaleString('tr-TR') }} TL
            </span>
          </p>
          <p class="text-sm text-muted mt-1">{{ lastTransaction.description }}</p>
          <p class="text-xs text-muted mt-1">{{ formatDate(lastTransaction.createdAt) }}</p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const { currentUser, transactions } = useMockData()

const lastTransaction = computed(() => {
  return transactions[0] ?? {
    amount: 0,
    description: '-',
    createdAt: new Date().toISOString()
  }
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
</script>
