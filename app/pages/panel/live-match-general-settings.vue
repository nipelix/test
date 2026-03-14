<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.live_match_general_settings') }}</h1>

    <UCard>
      <UForm :state="formState" @submit="handleSave">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField :label="t('settings.live_betting_duration')" name="liveBettingDuration">
              <UInput
                v-model="formState.liveBettingDuration"
                type="number"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="t('settings.delete_match_after')" name="deleteMatchAfter">
              <UInput
                v-model="formState.deleteMatchAfter"
                type="number"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="t('settings.block_coupon_cancelation_after')" name="blockCouponCancelationAfter">
              <UInput
                v-model="formState.blockCouponCancelationAfter"
                type="number"
                class="w-full"
              />
            </UFormField>
          </div>

          <USeparator />

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">{{ t('settings.live_betting_allowed') }}</span>
              <USwitch v-model="formState.liveBettingAllowed" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">{{ t('settings.combine_live_and_line_allowed') }}</span>
              <USwitch v-model="formState.combineLiveAndLineAllowed" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">{{ t('settings.odd_change') }}</span>
              <USwitch v-model="formState.oddChange" />
            </div>
          </div>

          <div class="flex justify-end">
            <UButton type="submit" color="primary">
              {{ t('common.save') }}
            </UButton>
          </div>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()
const toast = useToast()

const formState = reactive({
  liveBettingDuration: 0,
  deleteMatchAfter: 0,
  blockCouponCancelationAfter: 0,
  liveBettingAllowed: false,
  combineLiveAndLineAllowed: false,
  oddChange: false
})

const { data: settingsData } = await useAsyncData('live-match-settings', () =>
  $fetch<Record<string, any>>('/api/settings')
)

watch(settingsData, (val) => {
  if (!val) return
  const time = val.time_settings ?? {}
  const features = val.features ?? {}
  formState.liveBettingDuration = time.liveBettingDelaySec ?? 0
  formState.deleteMatchAfter = time.deleteMatchAfter ?? 0
  formState.blockCouponCancelationAfter = time.couponCancelTimeMin ?? 0
  formState.liveBettingAllowed = features.liveBettingAllowed ?? false
  formState.combineLiveAndLineAllowed = features.combineLiveAndLine ?? false
  formState.oddChange = features.oddChangeAutoAccept ?? false
}, { immediate: true })

async function handleSave() {
  try {
    await Promise.all([
      $fetch('/api/settings/GLOBAL/system/time_settings', {
        method: 'PUT',
        body: {
          value: {
            liveBettingDelaySec: formState.liveBettingDuration,
            couponCancelTimeMin: formState.blockCouponCancelationAfter,
            deleteMatchAfter: formState.deleteMatchAfter
          }
        }
      }),
      $fetch('/api/settings/GLOBAL/system/features', {
        method: 'PUT',
        body: {
          value: {
            liveBettingAllowed: formState.liveBettingAllowed,
            combineLiveAndLine: formState.combineLiveAndLineAllowed,
            oddChangeAutoAccept: formState.oddChange
          }
        }
      })
    ])
    toast.add({ title: t('common.save'), description: 'Settings saved successfully', color: 'green' })
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}
</script>
