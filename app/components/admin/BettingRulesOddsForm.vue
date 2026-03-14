<template>
  <UCard>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UFormField :label="t('rules.line_betting_min_odds')" name="lineMinOdds">
        <UInput :model-value="state.lineMinOdds" type="number" step="0.01" class="w-full" @update:model-value="emit('update', 'lineMinOdds', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.line_betting_max_odds')" name="lineMaxOdds">
        <UInput :model-value="state.lineMaxOdds" type="number" step="0.01" class="w-full" @update:model-value="emit('update', 'lineMaxOdds', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.live_betting_min_odds')" name="liveMinOdds">
        <UInput :model-value="state.liveMinOdds" type="number" step="0.01" class="w-full" @update:model-value="emit('update', 'liveMinOdds', Number($event))" />
      </UFormField>
      <UFormField :label="t('rules.live_betting_max_odds')" name="liveMaxOdds">
        <UInput :model-value="state.liveMaxOdds" type="number" step="0.01" class="w-full" @update:model-value="emit('update', 'liveMaxOdds', Number($event))" />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  state: {
    lineMinOdds: number
    lineMaxOdds: number
    liveMinOdds: number
    liveMaxOdds: number
  }
}>()

const emit = defineEmits<{
  update: [field: string, value: number]
}>()

const { t } = useI18n()
</script>
