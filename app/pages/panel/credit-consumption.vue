<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.credit_consumption') }}</h1>

    <!-- Default Settings -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ t('credit.default_settings') }}</h2>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField :label="t('credit.dealer_min_balance')">
          <UInput v-model="defaultSettings.dealerMinBalance" type="number" class="w-full" />
        </UFormField>
        <UFormField :label="t('credit.cancel_penalty')">
          <UInput v-model="defaultSettings.cancelPenalty" type="number" class="w-full" />
        </UFormField>
      </div>
      <div class="flex justify-end mt-4">
        <UButton color="primary" :loading="savingSettings" @click="saveSettings">{{ t('common.save') }}</UButton>
      </div>
    </UCard>

    <!-- Credit Tiers Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">{{ t('credit.credit_tiers') }}</h2>
          <UButton icon="i-lucide-plus" size="sm" variant="outline" @click="tierEditItem = null; tierModalOpen = true">
            {{ t('credit.add_tier') }}
          </UButton>
        </div>
      </template>

      <AdminUserTable
        :data="tierList.rows.value"
        :columns="tierColumns"
        :loading="tierList.status.value === 'pending'"
        :selected-ids="tierList.selectedIds"
        :all-selected="tierList.allSelected.value"
        :some-selected="tierList.someSelected.value"
        :selected-count="tierList.selectedRows.value.length"
        :total="tierList.total.value"
        :current-page="tierList.currentPage.value"
        :total-pages="tierList.totalPages.value"
        :page-size="tierList.pageSize.value"
        @toggle-row="tierList.toggleRow"
        @toggle-all="tierList.toggleAll"
        @update:current-page="tierList.currentPage.value = $event"
        @update:page-size="tierList.pageSize.value = $event"
      />
    </UCard>

    <AdminEntityFormModal
      v-model:open="tierModalOpen"
      :item="tierEditItem"
      :title="tierEditItem ? t('credit.edit_tier') : t('credit.add_tier')"
      :fields="tierFields"
      endpoint="/api/credit-ranges"
      @success="tierList.handleRefresh()"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] })

const { t } = useI18n()
const toast = useToast()

const defaultSettings = reactive({ dealerMinBalance: 0, cancelPenalty: 0 })
const savingSettings = ref(false)

const { data: settings } = await useAsyncData('credit-settings', () => $fetch<Record<string, any>>('/api/settings'))

watch(settings, (val) => {
  if (!val) return
  defaultSettings.dealerMinBalance = val.credit?.dealerMinBalance ?? 0
  defaultSettings.cancelPenalty = val.credit?.cancelPenalty ?? 0
}, { immediate: true })

async function saveSettings() {
  savingSettings.value = true
  try {
    await $fetch('/api/settings/GLOBAL/system/credit', { method: 'PUT', body: { value: { ...defaultSettings } } })
    toast.add({ title: t('common.saved'), color: 'success' })
  } catch { toast.add({ title: t('common.error'), color: 'error' }) }
  finally { savingSettings.value = false }
}

const tierColumns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'minAmount', header: t('credit.min_amount') },
  { accessorKey: 'maxAmount', header: t('credit.max_amount') },
  { accessorKey: 'creditDeduction', header: t('credit.credit_deduction') },
  { accessorKey: 'active', header: t('common.status') }
]

const tierList = useEntityList<any>('/api/credit-ranges', 'credit-tiers', tierColumns)

const tierModalOpen = ref(false)
const tierEditItem = ref<any>(null)

const tierFields = [
  { key: 'minAmount', label: t('credit.min_amount'), type: 'number' as const, required: true },
  { key: 'maxAmount', label: t('credit.max_amount'), type: 'number' as const, required: true },
  { key: 'creditDeduction', label: t('credit.credit_deduction'), type: 'number' as const, required: true }
]
</script>
