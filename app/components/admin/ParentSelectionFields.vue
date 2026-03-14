<template>
  <div class="space-y-4">
    <UFormField v-if="showAdmin" :label="t('modals.select_admin')" name="adminId" required :error="visibleErrors?.adminId">
      <USelectMenu v-model="parentState.adminId" :items="adminOptions" value-key="value" :placeholder="t('modals.select_admin')" class="w-full" @update:model-value="$emit('touch', 'adminId')" />
    </UFormField>

    <UFormField v-if="showAgent" :label="`${t('modals.select_agent')} (${t('modals.optional')})`" name="agentId">
      <USelectMenu v-model="parentState.agentId" :items="agentOptions" value-key="value" :placeholder="t('modals.select_agent')" class="w-full" />
    </UFormField>

    <UFormField v-if="showDealer" :label="t('modals.select_main_dealer')" name="dealerId" required :error="visibleErrors?.dealerId">
      <USelectMenu v-model="parentState.dealerId" :items="dealerOptions" value-key="value" :placeholder="t('modals.select_main_dealer')" class="w-full" @update:model-value="$emit('touch', 'dealerId')" />
    </UFormField>

    <UFormField v-if="showSubDealer" :label="t('modals.select_sub_dealer')" name="subDealerId" required :error="visibleErrors?.subDealerId">
      <USelectMenu v-model="parentState.subDealerId" :items="subDealerOptions" value-key="value" :placeholder="t('modals.select_sub_dealer')" class="w-full" @update:model-value="$emit('touch', 'subDealerId')" />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showAdmin: boolean
  showAgent: boolean
  showDealer: boolean
  showSubDealer: boolean
  adminOptions: Array<{ label: string; value: number }>
  agentOptions: Array<{ label: string; value: number }>
  dealerOptions: Array<{ label: string; value: number }>
  subDealerOptions: Array<{ label: string; value: number }>
  parentState: {
    adminId: number | null
    agentId: number | null
    dealerId: number | null
    subDealerId: number | null
  }
  visibleErrors?: Record<string, string | undefined>
}>()

defineEmits<{
  touch: [field: string]
}>()

const { t } = useI18n()
</script>
