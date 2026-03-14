<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('balance.check_balance') }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AdminStatCard
        icon="i-lucide-wallet"
        :label="t('balance.current_balance')"
        :value="formatBalance(wallet?.balance)"
        icon-bg-class="bg-green-100 dark:bg-green-900/30"
        icon-class="text-green-600"
      />
      <AdminStatCard
        icon="i-lucide-credit-card"
        :label="t('balance.credit_limit')"
        :value="formatBalance(wallet?.creditLimit)"
        icon-bg-class="bg-blue-100 dark:bg-blue-900/30"
        icon-class="text-blue-600"
      />
      <AdminStatCard
        icon="i-lucide-coins"
        :label="t('balance.currency')"
        :value="wallet?.currency ?? 'TRY'"
        icon-bg-class="bg-purple-100 dark:bg-purple-900/30"
        icon-class="text-purple-600"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatBalance } from '~~/shared/utils/formatters'

definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()

const { data: wallet } = await useAsyncData('my-wallet', () =>
  $fetch<{ balance: string; creditLimit: string; currency: string }>('/api/wallets/me')
)
</script>
