<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dealers.dealers_credits') }}</h1>

    <UTabs :items="tabs" class="w-full">
      <template #content="{ item }">
        <div v-if="item.value === 'manage'" class="mt-4">
          <UCard>
            <div class="space-y-4">
              <p class="text-sm text-muted">{{ t('dealers.credit_manage_description') }}</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField :label="t('common.amount')">
                  <UInput v-model="creditAmount" type="number" class="w-full" />
                </UFormField>
                <UFormField :label="t('common.operation')">
                  <USelectMenu v-model="creditOperation" :items="operationOptions" value-key="value" class="w-full" />
                </UFormField>
              </div>
              <UButton color="primary" :loading="processing" @click="handleCredit">{{ t('common.submit') }}</UButton>
            </div>
          </UCard>
        </div>

        <div v-if="item.value === 'stats'" class="mt-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminStatCard icon="i-lucide-coins" :label="t('credit.total_credit')" :value="auth.user?.walletType === 'CREDIT' ? currentBalance : '-'" icon-bg-class="bg-blue-100 dark:bg-blue-900/30" icon-class="text-blue-600" />
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()

const tabs = [
  { label: t('dealers.manage_balance'), value: 'manage' },
  { label: t('common.statistics'), value: 'stats' }
]

const creditAmount = ref(0)
const creditOperation = ref('add')
const processing = ref(false)
const currentBalance = ref('0')

const operationOptions = [
  { label: t('common.add'), value: 'add' },
  { label: t('common.remove'), value: 'remove' }
]

const { data: wallet } = await useAsyncData('my-wallet', () => $fetch<any>('/api/wallets/me'))
watch(wallet, (val) => { if (val) currentBalance.value = val.balance ?? '0' }, { immediate: true })

async function handleCredit() {
  if (!creditAmount.value || creditAmount.value <= 0) return
  processing.value = true
  try {
    const userId = auth.user?.id
    if (!userId) return
    const endpoint = creditOperation.value === 'add' ? 'credit' : 'credit-withdraw'
    await $fetch(`/api/wallets/${userId}/${endpoint}`, { method: 'POST', body: { amount: creditAmount.value } })
    toast.add({ title: t('modals.success_balance'), color: 'success' })
    creditAmount.value = 0
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  } finally { processing.value = false }
}
</script>
