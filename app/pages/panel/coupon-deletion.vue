<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-trash-2" class="w-5 h-5 text-red-500" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.coupon_deletion') }}</h1>
    </div>

    <UCard>
      <div class="space-y-4">
        <p class="text-sm text-muted">{{ t('dashboard.coupon_deletion_description') }}</p>

        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormField :label="t('common.status')">
            <USelectMenu v-model="filterStatus" :items="statusOptions" :placeholder="t('common.select')" />
          </UFormField>
          <UFormField :label="t('common.date')">
            <UInput v-model="filterDate" type="date" />
          </UFormField>
          <UFormField :label="t('dashboard.bet_slip_no')">
            <UInput v-model="filterBetSlipNo" placeholder="BSN-..." />
          </UFormField>
        </div>

        <div class="flex items-center gap-2">
          <UButton color="primary" icon="i-lucide-search" @click="applyFilters">
            {{ t('common.search') }}
          </UButton>
          <UButton variant="outline" color="error" icon="i-lucide-trash-2" :loading="deleting" :disabled="matchingCount === 0" @click="handleBulkDelete">
            {{ t('dashboard.delete_all_matching') }} ({{ matchingCount }})
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Password Confirmation -->
    <SharedPasswordConfirmDialog
      v-model:open="passwordDialogOpen"
      @confirmed="executeBulkDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] })

const { t } = useI18n()
const toast = useToast()

const filterStatus = ref('')
const filterDate = ref('')
const filterBetSlipNo = ref('')
const matchingCount = ref(0)
const deleting = ref(false)
const passwordDialogOpen = ref(false)

const statusOptions = ['ONGOING', 'WON', 'LOST', 'CANCELLED', 'REFUNDED']

async function applyFilters() {
  try {
    const query: Record<string, any> = {}
    if (filterStatus.value) query.status = filterStatus.value
    if (filterDate.value) query.date = filterDate.value
    if (filterBetSlipNo.value) query.betSlipNo = filterBetSlipNo.value

    const res = await $fetch<{ total: number }>('/api/coupons', { query: { ...query, limit: 0 } })
    matchingCount.value = res.total
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}

function handleBulkDelete() {
  passwordDialogOpen.value = true
}

async function executeBulkDelete() {
  deleting.value = true
  try {
    const query: Record<string, any> = {}
    if (filterStatus.value) query.status = filterStatus.value
    if (filterDate.value) query.date = filterDate.value
    if (filterBetSlipNo.value) query.betSlipNo = filterBetSlipNo.value

    await $fetch('/api/coupons/bulk-delete', { method: 'POST', body: query })
    toast.add({ title: t('modals.success_deleted'), color: 'success' })
    matchingCount.value = 0
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>
