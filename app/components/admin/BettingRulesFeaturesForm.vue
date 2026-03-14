<template>
  <UCard>
    <div class="space-y-4">
      <div v-for="feature in features" :key="feature.key" class="flex items-center justify-between">
        <span class="text-sm font-medium">{{ feature.label }}</span>
        <USwitch :model-value="(state as any)[feature.key]" @update:model-value="emit('update', feature.key, $event)" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  state: {
    liveBettingAllowed: boolean
    lineBettingAllowed: boolean
    combineLiveAndLine: boolean
    systemBetsAllowed: boolean
    combinationBoost: boolean
    combinationInsurance: boolean
    oddChangeAutoAccept: boolean
    allowSameEvent: boolean
    couponPreview: boolean
  }
}>()

const emit = defineEmits<{
  update: [field: string, value: boolean]
}>()

const { t } = useI18n()

const features = computed(() => [
  { key: 'liveBettingAllowed', label: t('rules.live_betting_allowed') },
  { key: 'lineBettingAllowed', label: t('rules.line_betting_allowed') },
  { key: 'combineLiveAndLine', label: t('rules.combine_live_and_line_allowed') },
  { key: 'systemBetsAllowed', label: t('rules.system_bets_offer_allowed') },
  { key: 'combinationBoost', label: t('rules.extra_combination') },
  { key: 'combinationInsurance', label: t('rules.insurance') },
  { key: 'oddChangeAutoAccept', label: t('rules.odd_change') },
  { key: 'allowSameEvent', label: t('rules.allow_same_event_selections') },
  { key: 'couponPreview', label: t('rules.coupon_preview') }
])
</script>
