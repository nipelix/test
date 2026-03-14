<template>
  <UCard>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UFormField :label="t('rules.min_stake')" name="minStake">
        <UInput :model-value="state.minStake" type="number" class="w-full" @update:model-value="emit('update', 'minStake', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.max_bet_amount')" name="maxBetAmount">
        <UInput :model-value="state.maxBetAmount" type="number" class="w-full" @update:model-value="emit('update', 'maxBetAmount', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.max_potential_payout')" name="maxPotentialPayout">
        <UInput :model-value="state.maxPotentialPayout" type="number" class="w-full" @update:model-value="emit('update', 'maxPotentialPayout', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.min_selections')" name="minSelections">
        <UInput :model-value="state.minSelections" type="number" class="w-full" @update:model-value="emit('update', 'minSelections', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.max_selections')" name="maxSelections">
        <UInput :model-value="state.maxSelections" type="number" class="w-full" @update:model-value="emit('update', 'maxSelections', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.line_bulk_odds')" name="lineBulkOdds">
        <UInput :model-value="state.lineBulkOdds" type="number" class="w-full" @update:model-value="emit('update', 'lineBulkOdds', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.live_bulk_odds')" name="liveBulkOdds">
        <UInput :model-value="state.liveBulkOdds" type="number" class="w-full" @update:model-value="emit('update', 'liveBulkOdds', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.coupon_cancel_window')" name="couponCancelMinutes">
        <UInput :model-value="state.couponCancelMinutes" type="number" class="w-full" @update:model-value="emit('update', 'couponCancelMinutes', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.live_delay_seconds')" name="liveDelaySeconds">
        <UInput :model-value="state.liveDelaySeconds" type="number" class="w-full" @update:model-value="emit('update', 'liveDelaySeconds', Number($event))" />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  state: {
    minStake: number
    maxBetAmount: number
    maxPotentialPayout: number
    minSelections: number
    maxSelections: number
    lineBulkOdds: number
    liveBulkOdds: number
    couponCancelMinutes: number
    liveDelaySeconds: number
  }
}>()

const emit = defineEmits<{
  update: [field: string, value: number]
}>()

const { t } = useI18n()
</script>
